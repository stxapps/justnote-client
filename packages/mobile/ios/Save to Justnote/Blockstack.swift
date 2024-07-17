//
//  Blockstack.swift
//  Save to Justnote
//
//  Created by Mac on 17/7/24.
//

import Foundation

class Blockstack {

  public static let shared = Blockstack()

  public func isUserSignedIn() -> Bool {
    return self.getUserData() != nil
  }

  public func addNote(_ text: String, callback: @escaping (_ publicUrl: String?, _ error: Error?) -> Void) {
    let listName = MY_NOTES
    let addedDT = Int64((Date().timeIntervalSince1970 * 1000.0).rounded())

    var body = text;
    if let regex = try? NSRegularExpression(pattern: "\r?\n") {
      let range = NSRange(body.startIndex..., in: body)
      body = regex.stringByReplacingMatches(in: body, range: range, withTemplate: "<br />")
    }
    body = "<p>\(body)</p>"

    let id = "\(addedDT)\(randomString(4))"
    let fpath = "notes/\(listName)/\(id)/index.json"
    let jsonObj: [String: Any] = ["title": "", "body": body]

    guard let data = try? JSONSerialization.data(withJSONObject: jsonObj),
          let content = String(data: data, encoding: .utf8) else {
      callback(nil, NSError.create(description: "JSON stringify error in addNote"))
      return
    }

    self.putFile(path: fpath, content: content, contentType: "application/json", callback: callback)
  }

  public func setDidShare() {
    userDefaults?.set("didShare=true", forKey: APP_GROUP_SHARE_SKEY)
  }

  private let defaultGaiaHubUrl = "https://hub.hiro.so"
  private let userDefaults = UserDefaults(suiteName: APP_GROUP_SHARE)

  private func getUserData() -> UserData? {
    // Can't store userData in a variable
    //   as it's possible signing out from app but this instance still alive in Safari process
    guard let s = userDefaults?.string(forKey: APP_GROUP_SHARE_UKEY),
          let d = s.data(using: .utf8),
          let uData = try? JSONDecoder().decode(UserData.self, from: d) else {
      return nil
    }
    return uData
  }

  private func getGaiaConfig(callback: @escaping (GaiaConfig?, Error?) -> Void) {
    if let config = self.retrieveGaiaConfig() {
      callback(config, nil)
      return
    }

    let userData = self.getUserData()
    let hubUrl = userData?.hubUrl ?? defaultGaiaHubUrl
    guard let appPrivateKey = userData?.privateKey else {
      callback(nil, NSError.create(description: "getGaiaConfig: not found appPrivateKey"))
      return
    }
    // If signed in from previous version, no gaiaAssociationToken in UserData.
    let gaiaAssociationToken = userData?.gaiaAssociationToken
    self.connectToGaiaHub(hubUrl: hubUrl, challengeSignerHex: appPrivateKey, gaiaAssociationToken: gaiaAssociationToken) { config, error in
      guard let config = config, error == nil else {
        callback(nil, error)
        return
      }

      self.saveGaiaConfig(config: config)
      callback(config, nil)
    }
  }

  private func connectToGaiaHub(hubUrl: String, challengeSignerHex: String, gaiaAssociationToken: String?, callback: @escaping (GaiaConfig?, Error?) -> Void) {
    self.getGaiaHubInfo(for: hubUrl) { hubInfo, error in
      guard error == nil, let hubInfo = hubInfo else {
        callback(nil, error)
        return
      }

      guard let gaiaChallenge = hubInfo.challengeText,
            let latestAuthVersion = hubInfo.latestAuthVersion,
            let readUrlPrefix = hubInfo.readUrlPrefix,
            let iss = Keys.getPublicKeyFromPrivate(challengeSignerHex, compressed: true),
            let salt = Keys.getEntropy(numberOfBytes:16) else {
        callback(nil, NSError.create(description: "connectToGaiaHub: invalid hubInfo"))
        return
      }

      let lavIndex = latestAuthVersion.index(latestAuthVersion.startIndex, offsetBy: 1)
      let lavNum = Int(latestAuthVersion[lavIndex...]) ?? 0
      if (lavNum < 1) {
        callback(nil, NSError.create(description: "connectToGaiaHub: Gaia server doesn't support v1"))
        return
      }

      var payload: [String: Any] = [
        "gaiaChallenge": gaiaChallenge,
        "hubUrl": hubUrl,
        "iss": iss,
        "salt": salt,
      ]
      if let gaiaAssociationToken = gaiaAssociationToken {
        payload["associationToken"] = gaiaAssociationToken
      }
      guard let address = Keys.getAddressFromPublicKey(iss),
            let signedPayload = JSONTokensJS().signToken(payload: payload, privateKey: challengeSignerHex) else {
        callback(nil, NSError.create(description: "connectToGaiaHub: invalid signedPayload"))
        return
      }
      let token = "v1:\(signedPayload)"

      let config = GaiaConfig(UrlPrefix: readUrlPrefix, address: address, token: token, server: hubUrl)
      callback(config, nil)
    }
  }

  private func getGaiaHubInfo(for hubUrl: String, callback: @escaping (GaiaHubInfo?, Error?) -> Void) {
    guard let url = URL(string: "\(hubUrl)/hub_info") else {
      callback(nil, NSError.create(description: "Error when declare url from hubInfoUrl"))
      return
    }

    let task = URLSession.shared.dataTask(with: url) { data, response, error in
      guard let data = data, error == nil else {
        callback(nil, error)
        return
      }

      guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
        callback(nil, NSError.create(description: "Error Gaia hub returns status code other than 2xx"))
        return
      }

      do {
        let hubInfo = try JSONDecoder().decode(GaiaHubInfo.self, from: data)
        callback(hubInfo, nil)
      } catch {
        callback(nil, error)
      }
    }
    task.resume()
  }

  private func saveGaiaConfig(config: GaiaConfig) {
    if let config = try? PropertyListEncoder().encode(config) {
      userDefaults?.set(config, forKey: APP_GROUP_SHARE_GKEY)
    }
  }

  private func retrieveGaiaConfig() -> GaiaConfig? {
    guard let d = userDefaults?.value(forKey: APP_GROUP_SHARE_GKEY) as? Data,
          let config = try? PropertyListDecoder().decode(GaiaConfig.self, from: d) else {
      return nil
    }
    return config
  }

  private func encrypt(content: Content) -> Data? {
    guard let privateKey = self.getUserData()?.privateKey else {
      return nil
    }
    let publicKey = Keys.getPublicKeyFromPrivate(privateKey)
    guard let recipientPublicKey = publicKey else {
      return nil
    }

    var cipherObjectJSON: String?
    switch content {
      case let .bytes(bytes):
        cipherObjectJSON = Encryption.encryptECIES(content: bytes, recipientPublicKey: recipientPublicKey, isString: false)
      case let .text(text):
        cipherObjectJSON = Encryption.encryptECIES(content: text, recipientPublicKey: recipientPublicKey)
    }
    guard let cipher = cipherObjectJSON else {
      return nil
    }

    return cipher.data(using: .utf8)
  }

  private func putFile(
    path: String,
    content: String,
    contentType: String,
    callback: @escaping (_ publicUrl: String?, _ error: Error?) -> Void) {

    guard let data = self.encrypt(content: .text(content)) else {
      callback(nil, NSError.create(description: "Encryption error in putFile"))
      return
    }

    self.getGaiaConfig() { config, error in
      guard let config = config, error == nil else {
        callback(nil, error)
        return
      }

      guard let server = config.server,
            let address = config.address,
            let token = config.token,
            let path = path.addingPercentEncoding(withAllowedCharacters: NSCharacterSet.urlPathAllowed),
            let putUrl = URL(string: "\(server)/store/\(address)/\(path)") else {
        callback(nil, NSError.create(description: "Error create putUrl in putFile"))
        return
      }

      var request = URLRequest(url: putUrl)
      request.httpMethod = "POST"
      request.setValue(contentType, forHTTPHeaderField: "Content-Type")
      request.setValue("bearer \(token)", forHTTPHeaderField: "Authorization")
      request.httpBody = data

      let task = URLSession.shared.dataTask(with: request) { data, response, error in
        guard error == nil else {
          callback(nil, error)
          return
        }

        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
          callback(nil, NSError.create(description: "Error uploading to Gaia hub returns status code other than 2xx"))
          return
        }

        guard let data = data,
              let result = try? JSONDecoder().decode(PutFileResponse.self, from: data),
              let publicUrl = result.publicUrl else {
          callback(nil, NSError.create(description: "Invalid putFile response"))
          return
        }

        callback(publicUrl, nil)
      }
      task.resume()
    }
  }

  private func randomString(_ length: Int) -> String {
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    return String((0..<length).map{ _ in characters.randomElement()!})
  }
}

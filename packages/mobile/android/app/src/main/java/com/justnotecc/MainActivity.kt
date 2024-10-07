package com.justnotecc

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Justnotecc"

  override fun onPause() {
    super.onPause()

    try {
      val reactContext = getReactInstanceManager().getCurrentReactContext()
      if (reactContext != null) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onMainActivityPause", null)
      }
    } catch (err: Exception) {
      Log.d("MainActivity", "Emit onMainActivityPause error", err)
    }
  }

  override fun onResume() {
    super.onResume()

    try {
      val reactContext = getReactInstanceManager().getCurrentReactContext()
      if (reactContext != null) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onMainActivityResume", null)
      }
    } catch (err: Exception) {
      Log.d("MainActivity", "Emit onMainActivityResume error", err)
    }
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}

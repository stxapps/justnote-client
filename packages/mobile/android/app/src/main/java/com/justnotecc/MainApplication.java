package com.justnotecc;

import com.justnotecc.generated.BasePackageList;

import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.core.util.Consumer;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.devsupport.interfaces.DevOptionHandler;
import com.facebook.react.devsupport.interfaces.DevSupportManager;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Arrays;

import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;

import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;

import org.wordpress.mobile.ReactNativeAztec.ReactAztecPackage;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeInterface;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergWebViewActivity;
import org.wordpress.mobile.ReactNativeGutenbergBridge.RNReactNativeGutenbergBridgePackage;

public class MainApplication extends Application implements ReactApplication, GutenbergBridgeInterface {

  private static final String TAG = "MainApplication";

  private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(new BasePackageList().getPackageList(), null);

  private ReactNativeHost mReactNativeHost;
  private RNReactNativeGutenbergBridgePackage mRnReactNativeGutenbergBridgePackage;
  private GutenbergBridgeJS2Parent.ReplaceUnsupportedBlockCallback mReplaceUnsupportedBlockCallback;

  private ReactNativeHost createReactNativeHost() {
    mRnReactNativeGutenbergBridgePackage = new RNReactNativeGutenbergBridgePackage(new GutenbergBridgeJS2Parent() {
      @Override
      public void responseHtml(String title, String html, boolean changed, ReadableMap contentInfo) {
      }

      @Override
      public void requestMediaImport(String url, MediaSelectedCallback mediaSelectedCallback) {
      }

      @Override
      public void requestMediaPickerFromDeviceCamera(MediaSelectedCallback mediaSelectedCallback, MediaType mediaType) {
      }

      @Override
      public void requestMediaPickFromDeviceLibrary(MediaSelectedCallback mediaSelectedCallback, Boolean allowMultipleSelection, MediaType mediaType) {
      }

      @Override
      public void requestMediaPickFromMediaLibrary(MediaSelectedCallback mediaSelectedCallback, Boolean allowMultipleSelection, MediaType mediaType) {
      }

      @Override
      public void mediaUploadSync(MediaSelectedCallback mediaSelectedCallback) {
      }

      @Override
      public void mediaSaveSync(MediaSelectedCallback mediaSelectedCallback) {
      }

      @Override
      public void requestImageFailedRetryDialog(int mediaId) {
      }

      @Override
      public void requestImageUploadCancelDialog(int mediaId) {
      }

      @Override
      public void requestImageUploadCancel(int mediaId) {
      }

      @Override
      public void editorDidMount(ReadableArray unsupportedBlockNames) {
      }

      @Override
      public void editorDidAutosave() {
      }

      @Override
      public void getOtherMediaPickerOptions(OtherMediaOptionsReceivedCallback otherMediaOptionsReceivedCallback, MediaType mediaType) {
      }

      @Override
      public void requestMediaPickFrom(String mediaSource, MediaSelectedCallback mediaSelectedCallback, Boolean allowMultipleSelection) {
      }

      @Override
      public void requestImageFullscreenPreview(String mediaUrl) {
      }

      @Override
      public void requestMediaEditor(MediaSelectedCallback mediaSelectedCallback, String mediaUrl) {
      }

      @Override
      public void logUserEvent(GutenbergUserEvent gutenbergUserEvent, ReadableMap eventProperties) {
      }

      @Override
      public void setFocalPointPickerTooltipShown(boolean tooltipShown) {
      }

      @Override
      public void requestFocalPointPickerTooltipShown(FocalPointPickerTooltipShownCallback focalPointPickerTooltipShownCallback) {
        focalPointPickerTooltipShownCallback.onRequestFocalPointPickerTooltipShown(false);
      }

      @Override
      public void editorDidEmitLog(String message, LogLevel logLevel) {
        switch (logLevel) {
        case TRACE:
          Log.d(TAG, message);
          break;
        case INFO:
          Log.i(TAG, message);
          break;
        case WARN:
          Log.w(TAG, message);
          break;
        case ERROR:
          Log.e(TAG, message);
          break;
        }
      }

      @Override
      public void performRequest(String path, Consumer<String> onSuccess, Consumer<Bundle> onError) {
      }

      @Override
      public void gutenbergDidRequestUnsupportedBlockFallback(ReplaceUnsupportedBlockCallback replaceUnsupportedBlockCallback,
                                                              String content,
                                                              String blockId,
                                                              String blockName,
                                                              String blockTitle) {
        mReplaceUnsupportedBlockCallback = replaceUnsupportedBlockCallback;
        openGutenbergWebView(content, blockId, blockTitle);
      }

      @Override
      public void onShowUserSuggestions(Consumer<String> onResult) {
        onResult.accept("matt");
      }

      @Override
      public void onShowXpostSuggestions(Consumer<String> onResult) {
        onResult.accept("ma.tt");
      }

      @Override
      public void requestMediaFilesEditorLoad(ReadableArray mediaFiles,
                                              String blockId) {
        Toast.makeText(MainApplication.this, "requestMediaFilesEditorLoad called", Toast.LENGTH_SHORT).show();
      }

      @Override
      public void requestMediaFilesFailedRetryDialog(ReadableArray mediaFiles) {
        Toast.makeText(MainApplication.this, "requestMediaFilesFailedRetryDialog called", Toast.LENGTH_SHORT).show();
      }

      @Override
      public void requestMediaFilesUploadCancelDialog(ReadableArray mediaFiles) {
        Toast.makeText(MainApplication.this, "requestMediaFilesUploadCancelDialog called", Toast.LENGTH_SHORT).show();
      }

      @Override
      public void requestMediaFilesSaveCancelDialog(ReadableArray mediaFiles) {
        Toast.makeText(MainApplication.this, "requestMediaFilesSaveCancelDialog called", Toast.LENGTH_SHORT).show();
      }

      @Override
      public void mediaFilesBlockReplaceSync(ReadableArray mediaFiles,
                                             String blockId) {
        Toast.makeText(MainApplication.this, "mediaFilesBlockReplaceSync called", Toast.LENGTH_SHORT).show();
      }

      @Override
      public void gutenbergDidSendButtonPressedAction(String buttonType) {
      }

    }, isDarkMode());

    return new ReactNativeHost(this) {
      @Override
      public boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
      }

      @Override
      protected List<ReactPackage> getPackages() {
        @SuppressWarnings("UnnecessaryLocalVariable")
        List<ReactPackage> packages = new PackageList(this).getPackages();
        // Packages that cannot be autolinked yet can be added manually here, for example:
        // packages.add(new MyReactNativePackage());
        packages.add(mRnReactNativeGutenbergBridgePackage);
        packages.add(new ReactAztecPackage(null, null));
        packages.add(new RNGestureHandlerPackage());

        // Add unimodules
        List<ReactPackage> unimodules = Arrays.<ReactPackage>asList(
          new ModuleRegistryAdapter(mModuleRegistryProvider)
        );
        packages.addAll(unimodules);

        return packages;
      }

      @Override
      protected String getJSMainModuleName() {
        return "index";
      }
    };
  }

  private boolean isDarkMode() {
    Configuration configuration = getResources().getConfiguration();
    int currentNightMode = configuration.uiMode & Configuration.UI_MODE_NIGHT_MASK;

    return currentNightMode == Configuration.UI_MODE_NIGHT_YES;
  }

  private void openGutenbergWebView(String content,
                                    String blockId,
                                    String blockName) {
    Intent intent = new Intent(this, GutenbergWebViewActivity.class);
    intent.putExtra(GutenbergWebViewActivity.ARG_BLOCK_CONTENT, content);
    intent.putExtra(GutenbergWebViewActivity.ARG_BLOCK_ID, blockId);
    intent.putExtra(GutenbergWebViewActivity.ARG_BLOCK_NAME, blockName);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    startActivity(intent);
  }

  @Override
  public ReactNativeHost getReactNativeHost() {
    if (mReactNativeHost == null) {
      mReactNativeHost = createReactNativeHost();
      createCustomDevOptions(mReactNativeHost);
    }

    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.justnotecc.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }

  private void createCustomDevOptions(ReactNativeHost reactNativeHost) {
    DevSupportManager devSupportManager = reactNativeHost.getReactInstanceManager().getDevSupportManager();

    devSupportManager.addCustomDevOption("Show html", new DevOptionHandler() {
      @Override
      public void onOptionSelected() {
        mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().toggleEditorMode();
      }
    });
  }

  @Override
  public void saveContent(String content, String blockId) {
    if (mReplaceUnsupportedBlockCallback != null) {
      mReplaceUnsupportedBlockCallback.replaceUnsupportedBlock(content, blockId);
    }
  }
}

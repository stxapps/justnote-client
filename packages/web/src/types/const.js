export const DOMAIN_NAME = 'https://justnote.cc';

export const APP_NAME = 'Justnote';
export const APP_ICON_NAME = 'logo-for-stacks-access.png';
export const APP_SCOPES = ['store_write'];
export const APP_URL_SCHEME = 'justnotecc';
export const APP_DOMAIN_NAME = 'justnotecc://app';
export const BLOCKSTACK_AUTH = '/blockstack-auth';

export const HASH_FRAGMENT_IDENTIFIER = 'HASH_FRAGMENT_IDENTIFIER';

export const HASH_LANDING = '#landing';
export const HASH_LANDING_MOBILE = '#landing-mobile';
export const HASH_ABOUT = '#about';
export const HASH_TERMS = '#terms';
export const HASH_PRIVACY = '#privacy';
export const HASH_SUPPORT = '#support';

export const HTTP = 'http://';
export const HTTPS = 'https://';
export const WWW = 'www.';

export const VALID_URL = 'VALID_URL';
export const NO_URL = 'NO_URL';
export const ASK_CONFIRM_URL = 'ASK_CONFIRM_URL';

export const SM_WIDTH = 640;
export const MD_WIDTH = 768;
export const LG_WIDTH = 1024;
export const XL_WIDTH = 1280;

export const MY_NOTES = 'My Notes';
export const TRASH = 'Trash';
export const ARCHIVE = 'Archive';

export const NEW_NOTE = 'NEW_NOTE';
export const NEW_NOTE_OBJ = { id: NEW_NOTE, title: '', body: '', media: [] };
export const DUMMY_NOTE_OBJ = { id: null, title: '', body: '', media: [] };

export const SIGN_UP_POPUP = 'SIGN_UP_POPUP';
export const SIGN_IN_POPUP = 'SIGN_IN_POPUP';
export const PROFILE_POPUP = 'PROFILE_POPUP';
export const NOTE_LIST_MENU_POPUP = 'NOTE_LIST_MENU_POPUP';
export const NOTE_LIST_ITEM_MENU_POPUP = 'NOTE_LIST_ITEM_MENU_POPUP';
export const LIST_NAMES_POPUP = 'LIST_NAMES_POPUP';
export const PIN_MENU_POPUP = 'PIN_MENU_POPUP';
export const SIDEBAR_POPUP = 'SIDEBAR_POPUP';
export const SEARCH_POPUP = 'SEARCH_POPUP';
export const SETTINGS_POPUP = 'SETTINGS_POPUP';
export const SETTINGS_LISTS_MENU_POPUP = 'SETTINGS_LISTS_MENU_POPUP';
export const TIME_PICK_POPUP = 'TIME_PICK_POPUP';
export const DATE_FORMAT_MENU_POPUP = 'DATE_FORMAT_MENU_POPUP';
export const CONFIRM_DELETE_POPUP = 'CONFIRM_DELETE_POPUP';
export const CONFIRM_DISCARD_POPUP = 'CONFIRM_DISCARD_POPUP';
export const CONFIRM_AS_DUMMY_POPUP = 'CONFIRM_AS_DUMMY_POPUP';
export const CONFIRM_EXIT_DUMMY_POPUP = 'CONFIRM_EXIT_DUMMY_POPUP';
export const PAYWALL_POPUP = 'PAYWALL_POPUP';
export const ACCESS_ERROR_POPUP = 'ACCESS_ERROR_POPUP';
export const STALE_ERROR_POPUP = 'STALE_ERROR_POPUP';

export const ADDED = 'ADDED';
export const ADDING = 'ADDING';
export const UPDATING = 'UPDATING';
export const MOVING = 'MOVING';
export const DELETING = 'DELETING';
export const MERGING = 'MERGING';
export const DIED_ADDING = 'DIED_ADDING';
export const DIED_UPDATING = 'DIED_UPDATING';
export const DIED_MOVING = 'DIED_MOVING';
export const DIED_DELETING = 'DIED_DELETING';
export const DIED_MERGING = 'DIED_MERGING';

export const REMOVE = 'Remove';
export const RESTORE = 'Restore';
export const DELETE = 'Permanently delete';
export const MOVE_TO = 'Move to';

export const VIEW_AS_WEBPAGE = 'View as Webpage';
export const SHARE = 'Share';
export const EXPORT_AS_PDF = 'Export as PDF';

export const NOTE_ITEM_POPUP_MENU = {
  [MY_NOTES]: [ARCHIVE, REMOVE, MOVE_TO],
  [TRASH]: [RESTORE, DELETE],
  [ARCHIVE]: [REMOVE, MOVE_TO],
};

export const ZERO = 'ZERO'; // top or left of the window
export const CENTER = 'CENTER'; // center of the window
export const EDGE = 'EDGE'; // bottom or right of the window
export const AT_TRIGGER = 'AT_TRIGGER'; // top or left of the trigger
export const EDGE_TRIGGER = 'EDGE_TRIGGER'; // bottom or right of the trigger

export const CD_ROOT = 'cdroot';
export const NOTES = 'notes';
export const IMAGES = 'images';
export const SETTINGS = 'settings';
export const PINS = 'pins';
export const UNSAVED_NOTES = 'unsaved-notes';
export const INDEX = 'index';
export const DOT_JSON = '.json';
export const BASE64 = 'base64';
export const UTF8 = 'utf8';

export const N_NOTES = 10;
export const MAX_TRY = 3;
export const N_DAYS = 45;
export const MAX_SELECTED_NOTE_IDS = 10;
export const MAX_CHARS = 600;

export const ID = 'id';
export const STATUS = 'status';

export const VALID_LIST_NAME = 'VALID_LIST_NAME';
export const NO_LIST_NAME = 'NO_LIST_NAME';
export const TOO_LONG_LIST_NAME = 'TOO_LONG_LIST_NAME';
export const DUPLICATE_LIST_NAME = 'DUPLICATE_LIST_NAME';
export const IN_USE_LIST_NAME = 'IN_USE_LIST_NAME';

export const SWAP_LEFT = 'SWAP_LEFT';
export const SWAP_RIGHT = 'SWAP_RIGHT';

export const ADDED_DT = 'addedDT';
export const UPDATED_DT = 'updatedDT';

export const IS_USER_DUMMY = 'isUserDummy';
export const COLS_PANEL_STATE = 'colsPanelState';

export const SHOW_SYNCED = 'SHOW_SYNCED';

export const MOVE_ACTION_NOTE_COMMANDS = 0;
export const MOVE_ACTION_NOTE_ITEM_MENU = 1;

export const DELETE_ACTION_NOTE_COMMANDS = 0;
export const DELETE_ACTION_NOTE_ITEM_MENU = 1;
export const DELETE_ACTION_LIST_NAME = 2;

export const DISCARD_ACTION_CANCEL_EDIT = 0;
export const DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH = 1;
export const DISCARD_ACTION_UPDATE_NOTE_ID = 2;
export const DISCARD_ACTION_CHANGE_LIST_NAME = 3;
export const DISCARD_ACTION_UPDATE_SYNCED = 4;
export const DISCARD_ACTION_UPDATE_BULK_EDIT_URL_HASH = 5;
export const DISCARD_ACTION_UPDATE_BULK_EDIT = 6;
export const DISCARD_ACTION_SHOW_NOTE_LIST_MENU_POPUP = 8;
export const DISCARD_ACTION_SHOW_NLIM_POPUP = 7;

export const MODE_VIEW = 'MODE_VIEW';
export const MODE_EDIT = 'MODE_EDIT';

export const IMAGE_FILE_EXTS = [
  'apng', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp',
  'bmp', 'ico', 'cur', 'tif', 'tiff',
];

export const IAP_URL = 'https://iap-001.uc.r.appspot.com'; //'http://192.168.1.44:8088';
export const IAP_VERIFY_URL = IAP_URL + '/verify';
export const IAP_STATUS_URL = IAP_URL + '/status';

export const APPSTORE = 'AppStore';
export const PLAYSTORE = 'PlayStore';
export const COM_JUSTNOTECC = 'com.justnotecc';
export const COM_JUSTNOTECC_SUPPORTER = 'com.justnotecc.supporter';
export const SIGNED_TEST_STRING = 'Privacy Security UX';

export const VALID = 'VALID';
export const INVALID = 'INVALID';
export const UNKNOWN = 'UNKNOWN';
export const ERROR = 'ERROR';

export const ACTIVE = 'Active';
export const NO_RENEW = 'NoRenew';
export const GRACE = 'GracePeriod';
export const ON_HOLD = 'OnHold';
export const PAUSED = 'Paused';
export const EXPIRED = 'Expired';
//export const UNKNOWN = 'UNKNOWN';

export const PIN = 'Pin to the top';
export const MANAGE_PIN = 'Manage pin';
export const UNPIN = 'Unpin';
export const PIN_UP = 'Move pin up';
export const PIN_DOWN = 'Move pin down';

export const PINNED = 'PINNED';

export const SETTINGS_VIEW_ACCOUNT = 1;
export const SETTINGS_VIEW_IAP = 9;
export const SETTINGS_VIEW_IAP_RESTORE = 10;
export const SETTINGS_VIEW_DATA = 2;
export const SETTINGS_VIEW_DATA_IMPORT = 7;
export const SETTINGS_VIEW_DATA_EXPORT = 3;
export const SETTINGS_VIEW_DATA_DELETE = 4;
export const SETTINGS_VIEW_LISTS = 5;
export const SETTINGS_VIEW_MISC = 6;
export const SETTINGS_VIEW_ABOUT = 8;

export const LIST_NAMES_MODE_MOVE_NOTES = 'LIST_NAMES_MODE_MOVE_NOTES';
export const LIST_NAMES_MODE_MOVE_LIST_NAME = 'LIST_NAMES_MODE_MOVE_LIST_NAME';

export const NOTE_DATE_SHOWING_MODE_HIDE = 0;
export const NOTE_DATE_SHOWING_MODE_SHOW = 1;

export const NOTE_DATE_FORMAT_SYSTEM = 'SYSTEM';
export const NOTE_DATE_FORMAT_YSMSD = 'YSMSD';
export const NOTE_DATE_FORMAT_MSDSY = 'MSDSY';
export const NOTE_DATE_FORMAT_DSMSY = 'DSMSY';
export const NOTE_DATE_FORMAT_YHMHD = 'YHMHD';
export const NOTE_DATE_FORMAT_MHDHY = 'MHDHY';
export const NOTE_DATE_FORMAT_DHMHY = 'DHMHY';
export const NOTE_DATE_FORMAT_YOMOD = 'YOMOD';
export const NOTE_DATE_FORMAT_MODOY = 'MODOY';
export const NOTE_DATE_FORMAT_DOMOY = 'DOMOY';
export const NOTE_DATE_FORMAT_YMMMD = 'YMMMD';
export const NOTE_DATE_FORMAT_MMMDY = 'MMMDY';
export const NOTE_DATE_FORMAT_DMMMY = 'DMMMY';

export const NOTE_DATE_FORMATS = [
  NOTE_DATE_FORMAT_SYSTEM, NOTE_DATE_FORMAT_YSMSD, NOTE_DATE_FORMAT_MSDSY,
  NOTE_DATE_FORMAT_DSMSY, NOTE_DATE_FORMAT_YHMHD, NOTE_DATE_FORMAT_MHDHY,
  NOTE_DATE_FORMAT_DHMHY, NOTE_DATE_FORMAT_YOMOD, NOTE_DATE_FORMAT_MODOY,
  NOTE_DATE_FORMAT_DOMOY, NOTE_DATE_FORMAT_YMMMD, NOTE_DATE_FORMAT_MMMDY,
  NOTE_DATE_FORMAT_DMMMY,
];
export const NOTE_DATE_FORMAT_TEXTS = [
  'System', 'Y/M/D', 'M/D/Y', 'D/M/Y', 'Y-M-D', 'M-D-Y', 'D-M-Y', 'Y.M.D', 'M.D.Y',
  'D.M.Y', 'Y, MMM D', 'MMM D, Y', 'D MMM, Y',
];

export const LOCAL_SETTINGS_STATE = 'LOCAL_SETTINGS_STATE';

export const WHT_MODE = 0;
export const BLK_MODE = 1;
export const SYSTEM_MODE = 2;
export const CUSTOM_MODE = 3;

export const FEATURE_PIN = 'FEATURE_PIN';
export const FEATURE_APPEARANCE = 'FEATURE_APPEARANCE';
export const FEATURE_DATE_FORMAT = 'FEATURE_DATE_FORMAT';
export const FEATURE_SECTION_NOTES_BY_MONTH = 'FEATURE_SECTION_NOTES_BY_MONTH';
export const FEATURE_MORE_EDITOR_FONT_SIZES = 'FEATURE_MORE_EDITOR_FONT_SIZES';

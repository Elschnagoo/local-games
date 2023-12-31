export const conf = {
  nested: {
    LanguageSetting: {
      fields: {
        language: {
          type: 'string',
          id: 1,
        },
        option: {
          type: 'LanguageOption',
          id: 2,
        },
      },
    },
    UserSettings: {
      fields: {
        installPath: {
          type: 'string',
          id: 1,
        },
        playRegion: {
          type: 'string',
          id: 2,
        },
        desktopShortcut: {
          type: 'ShortcutOption',
          id: 3,
        },
        startmenuShortcut: {
          type: 'ShortcutOption',
          id: 4,
        },
        languageSettings: {
          type: 'LanguageSettingType',
          id: 5,
        },
        selectedTextLanguage: {
          type: 'string',
          id: 6,
        },
        selectedSpeechLanguage: {
          type: 'string',
          id: 7,
        },
        languages: {
          rule: 'repeated',
          type: 'LanguageSetting',
          id: 8,
        },
        gfxOverrideTags: {
          type: 'string',
          id: 9,
        },
        versionbranch: {
          type: 'string',
          id: 10,
        },
      },
    },
    InstallHandshake: {
      fields: {
        product: {
          type: 'string',
          id: 1,
        },
        uid: {
          type: 'string',
          id: 2,
        },
        settings: {
          type: 'UserSettings',
          id: 3,
        },
      },
    },
    BuildConfig: {
      fields: {
        region: {
          type: 'string',
          id: 1,
        },
        buildConfig: {
          type: 'string',
          id: 2,
        },
      },
    },
    BaseProductState: {
      fields: {
        installed: {
          type: 'bool',
          id: 1,
        },
        playable: {
          type: 'bool',
          id: 2,
        },
        updateComplete: {
          type: 'bool',
          id: 3,
        },
        backgroundDownloadAvailable: {
          type: 'bool',
          id: 4,
        },
        backgroundDownloadComplete: {
          type: 'bool',
          id: 5,
        },
        currentVersion: {
          type: 'string',
          id: 6,
        },
        currentVersionStr: {
          type: 'string',
          id: 7,
        },
        installedBuildConfig: {
          rule: 'repeated',
          type: 'BuildConfig',
          id: 8,
        },
        backgroundDownloadBuildConfig: {
          rule: 'repeated',
          type: 'BuildConfig',
          id: 9,
        },
        decryptionKey: {
          type: 'string',
          id: 10,
        },
        completedInstallActions: {
          rule: 'repeated',
          type: 'string',
          id: 11,
        },
      },
    },
    BackfillProgress: {
      fields: {
        progress: {
          type: 'double',
          id: 1,
        },
        backgrounddownload: {
          type: 'bool',
          id: 2,
        },
        paused: {
          type: 'bool',
          id: 3,
        },
        downloadLimit: {
          type: 'uint64',
          id: 4,
        },
      },
    },
    RepairProgress: {
      fields: {
        progress: {
          type: 'double',
          id: 1,
        },
      },
    },
    UpdateProgress: {
      fields: {
        lastDiscSetUsed: {
          type: 'string',
          id: 1,
        },
        progress: {
          type: 'double',
          id: 2,
        },
        discIgnored: {
          type: 'bool',
          id: 3,
        },
        totalToDownload: {
          type: 'uint64',
          id: 4,
          options: {
            default: 0,
          },
        },
        downloadRemaining: {
          type: 'uint64',
          id: 5,
          options: {
            default: 0,
          },
        },
      },
    },
    CachedProductState: {
      fields: {
        baseProductState: {
          type: 'BaseProductState',
          id: 1,
        },
        backfillProgress: {
          type: 'BackfillProgress',
          id: 2,
        },
        repairProgress: {
          type: 'RepairProgress',
          id: 3,
        },
        updateProgress: {
          type: 'UpdateProgress',
          id: 4,
        },
      },
    },
    ProductOperations: {
      fields: {
        activeOperation: {
          type: 'Operation',
          id: 1,
          options: {
            default: 'OP_NONE',
          },
        },
        priority: {
          type: 'uint64',
          id: 2,
        },
      },
    },
    ProductInstall: {
      fields: {
        uid: {
          type: 'string',
          id: 1,
        },
        productCode: {
          type: 'string',
          id: 2,
        },
        settings: {
          type: 'UserSettings',
          id: 3,
        },
        cachedProductState: {
          type: 'CachedProductState',
          id: 4,
        },
        productOperations: {
          type: 'ProductOperations',
          id: 5,
        },
      },
    },
    ProductConfig: {
      fields: {
        productCode: {
          type: 'string',
          id: 1,
        },
        metadataHash: {
          type: 'string',
          id: 2,
        },
        timestamp: {
          type: 'string',
          id: 3,
        },
      },
    },
    ActiveProcess: {
      fields: {
        processName: {
          type: 'string',
          id: 1,
        },
        pid: {
          type: 'int32',
          id: 2,
        },
        uri: {
          rule: 'repeated',
          type: 'string',
          id: 3,
        },
      },
    },
    DownloadSettings: {
      fields: {
        downloadLimit: {
          type: 'int32',
          id: 1,
          options: {
            default: -1,
          },
        },
        backfillLimit: {
          type: 'int32',
          id: 2,
          options: {
            default: -1,
          },
        },
      },
    },
    Database: {
      fields: {
        productInstall: {
          rule: 'repeated',
          type: 'ProductInstall',
          id: 1,
        },
        activeInstalls: {
          rule: 'repeated',
          type: 'InstallHandshake',
          id: 2,
        },
        activeProcesses: {
          rule: 'repeated',
          type: 'ActiveProcess',
          id: 3,
        },
        productConfigs: {
          rule: 'repeated',
          type: 'ProductConfig',
          id: 4,
        },
        downloadSettings: {
          type: 'DownloadSettings',
          id: 5,
        },
      },
    },
    LanguageOption: {
      values: {
        LANGOPTION_NONE: 0,
        LANGOPTION_TEXT: 1,
        LANGOPTION_SPEECH: 2,
        LANGOPTION_TEXT_AND_SPEECH: 3,
      },
    },
    LanguageSettingType: {
      values: {
        LANGSETTING_NONE: 0,
        LANGSETTING_SINGLE: 1,
        LANGSETTING_SIMPLE: 2,
        LANGSETTING_ADVANCED: 3,
      },
    },
    ShortcutOption: {
      values: {
        SHORTCUT_NONE: 0,
        SHORTCUT_USER: 1,
        SHORTCUT_ALL_USERS: 2,
      },
    },
    Operation: {
      values: {
        OP_NONE: -1,
        OP_UPDATE: 0,
        OP_BACKFILL: 1,
        OP_REPAIR: 2,
      },
    },
  },
};

export type AppConf = {
  name: string;
};
export const Apps: Record<string, AppConf> = {
  w3: {
    name: 'Warcraft III',
  },
  heroes: {
    name: 'Heroes of the Storm',
  },
  s1: {
    name: 'StarCraft',
  },
  s2: {
    name: 'StarCraft II',
  },
  anbs: {
    name: 'Diablo Immortal',
  },
  diablo3: {
    name: 'Diablo III',
  },
  fenris: {
    name: 'Diablo IV',
  },
  wow: {
    name: 'World of Warcraft',
  },
  wow_classic: {
    name: 'World of Warcraft WotLK Classic',
  },
  wow_classic_era: {
    name: 'World of Warcraft Classic',
  },
  prometheus: {
    name: 'Overwatch',
  },
  star: {
    name: 'StarCraft Anthology',
  },
  hs_beta: {
    name: 'Heartstone',
  },
  hs: {
    name: 'Heartstone',
  },
};

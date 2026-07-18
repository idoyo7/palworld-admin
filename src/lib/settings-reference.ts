// 팰월드 서버 설정 레퍼런스 (옵션 설명 / 기본값 / 범위·최댓값 / ini 키).
//
// 데이터 출처: palworld-settings-reference 워크플로우(웹 리서치+적대적 검증, 2026-07-15).
// 52개 게임플레이 설정 전수 검증. 현재값(currentValue)은 런타임에 configmap 에서 병합.

export type SettingType = "float" | "int" | "bool" | "enum" | "string";

export interface SettingRef {
  envKey: string;
  iniKey: string;
  koName: string;
  explanation: string;
  type: SettingType;
  defaultValue: string;
  minValue: string; // 슬라이더/문서상 최솟값 (없으면 "")
  maxValue: string; // 월드설정 UI 슬라이더 최댓값 우선 (bool/enum 은 가능한 값)
  category: string;
  note?: string;
}

export const SETTING_CATEGORIES = [
  "경험치/시간/작업속도",
  "플레이어",
  "팰(Pal)",
  "아이템/드롭/채집",
  "거점/건축",
  "길드/PvP/인원/토글",
  "네트워크/운영",
  "월드/기타",
  "성능",
] as const;

export const SETTINGS_REFERENCE: SettingRef[] = [
  // ── 경험치/시간/작업속도 ──
  { envKey: "EXP_RATE", iniKey: "ExpRate", koName: "경험치 획득 배율", explanation: "높을수록 플레이어·팰이 얻는 경험치가 늘어 레벨업이 빨라진다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "20", category: "경험치/시간/작업속도" },
  { envKey: "DAYTIME_SPEEDRATE", iniKey: "DayTimeSpeedRate", koName: "낮 시간 흐름 속도", explanation: "높을수록 낮이 빨리 지나가 낮이 짧아진다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5", category: "경험치/시간/작업속도" },
  { envKey: "NIGHTTIME_SPEEDRATE", iniKey: "NightTimeSpeedRate", koName: "밤 시간 흐름 속도", explanation: "높을수록 밤이 빨리 지나가 아침이 금방 온다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5", category: "경험치/시간/작업속도" },
  { envKey: "WORK_SPEED_RATE", iniKey: "WorkSpeedRate", koName: "작업 속도 배율", explanation: "높을수록 팰·플레이어의 제작·건설·채집 작업이 빨라진다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5", category: "경험치/시간/작업속도", note: "슬라이더 최댓값 5는 잠정값(미확인). ini로는 그 이상 가능 — 현재 10.0은 일반 슬라이더 범위 초과." },

  // ── 플레이어 ──
  { envKey: "PLAYER_DAMAGE_RATE_ATTACK", iniKey: "PlayerDamageRateAttack", koName: "플레이어 공격 데미지 배율", explanation: "높을수록 플레이어가 주는 피해가 커져 전투가 쉬워진다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "플레이어" },
  { envKey: "PLAYER_DAMAGE_RATE_DEFENSE", iniKey: "PlayerDamageRateDefense", koName: "플레이어 피격 데미지 배율", explanation: "낮을수록 받는 피해가 줄어 잘 안 죽는다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "플레이어", note: "현재 0.2 = 받는 피해 1/5 (매우 튼튼)." },
  { envKey: "PLAYER_AUTO_HP_REGEN_RATE", iniKey: "PlayerAutoHPRegeneRate", koName: "플레이어 HP 자동 회복", explanation: "높을수록 평상시 체력이 빠르게 회복된다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "플레이어" },
  { envKey: "PLAYER_AUTO_HP_REGEN_RATE_IN_SLEEP", iniKey: "PlayerAutoHpRegeneRateInSleep", koName: "수면 중 HP 회복", explanation: "높을수록 침대에서 잘 때 체력이 빠르게 회복된다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "플레이어" },
  { envKey: "PLAYER_STAMINA_DECREASE_RATE", iniKey: "PlayerStaminaDecreaceRate", koName: "플레이어 스태미나 소모", explanation: "낮을수록 스태미나가 천천히 닳아 오래 버틴다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "플레이어", note: "현재 0.2 = 소모 1/5." },
  { envKey: "PLAYER_STOMACH_DECREASE_RATE", iniKey: "PlayerStomachDecreaceRate", koName: "플레이어 포만도 감소", explanation: "낮을수록 배가 천천히 고파진다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "플레이어" },

  // ── 팰(Pal) ──
  { envKey: "PAL_DAMAGE_RATE_ATTACK", iniKey: "PalDamageRateAttack", koName: "팰 공격 피해 배율", explanation: "높을수록 팰이 적에게 주는 피해가 커진다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "팰(Pal)", note: "현재 3.0 = 팰 공격력 3배." },
  { envKey: "PAL_DAMAGE_RATE_DEFENSE", iniKey: "PalDamageRateDefense", koName: "팰 피격 피해 배율", explanation: "낮을수록 팰이 받는 피해가 줄어 더 튼튼해진다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "팰(Pal)", note: "현재 0.4 = 받는 피해 40%." },
  { envKey: "PAL_AUTO_HP_REGEN_RATE", iniKey: "PalAutoHPRegeneRate", koName: "팰 HP 자동 회복", explanation: "높을수록 팰 HP가 빠르게 자동 회복된다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "팰(Pal)" },
  { envKey: "PAL_AUTO_HP_REGEN_RATE_IN_SLEEP", iniKey: "PalAutoHpRegeneRateInSleep", koName: "팰 팰박스 대기 회복", explanation: "높을수록 팰박스에서 쉬는 팰의 HP가 빠르게 회복된다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "팰(Pal)" },
  { envKey: "PAL_STAMINA_DECREASE_RATE", iniKey: "PalStaminaDecreaceRate", koName: "팰 스태미나 감소", explanation: "낮을수록 팰 스태미나가 천천히 닳는다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "팰(Pal)" },
  { envKey: "PAL_STOMACH_DECREASE_RATE", iniKey: "PalStomachDecreaceRate", koName: "팰 포만도 감소", explanation: "낮을수록 팰이 천천히 배고파져 먹이를 덜 챙겨도 된다.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "5.0", category: "팰(Pal)" },
  { envKey: "PAL_CAPTURE_RATE", iniKey: "PalCaptureRate", koName: "팰 포획 성공률 배율", explanation: "높을수록 팰을 더 쉽게 포획한다.", type: "float", defaultValue: "1.0", minValue: "0.5", maxValue: "2.0", category: "팰(Pal)", note: "슬라이더 상한 2.0 — 현재 3.0은 ini로 상한을 초과 설정한 값." },
  { envKey: "PAL_SPAWN_NUM_RATE", iniKey: "PalSpawnNumRate", koName: "팰 출현 수 배율", explanation: "높을수록 야생 팰이 더 많이 출현한다(서버 부하 증가).", type: "float", defaultValue: "1.0", minValue: "0.5", maxValue: "3.0", category: "팰(Pal)" },
  { envKey: "PAL_EGG_DEFAULT_HATCHING_TIME", iniKey: "PalEggDefaultHatchingTime", koName: "알 부화 시간(시간)", explanation: "낮을수록 알이 빨리 부화한다. (배율 아님, 시간 단위)", type: "float", defaultValue: "72.0", minValue: "0", maxValue: "240", category: "팰(Pal)", note: "현재 2.0 = 2시간 만에 부화(매우 빠름). 0이면 즉시." },

  // ── 아이템/드롭/채집 ──
  { envKey: "ITEM_WEIGHT_RATE", iniKey: "ItemWeightRate", koName: "아이템 무게 배율", explanation: "낮을수록 아이템이 가벼워 훨씬 많이 들 수 있다.", type: "float", defaultValue: "1.0", minValue: "0", maxValue: "10", category: "아이템/드롭/채집", note: "현재 0.033 = 사실상 무게 무시(무한 운반에 가까움). 0이면 무게 제거." },
  { envKey: "COLLECTION_DROP_RATE", iniKey: "CollectionDropRate", koName: "채집물 획득량 배율", explanation: "높을수록 나무·광석 채집 시 더 많이 얻는다.", type: "float", defaultValue: "1.0", minValue: "0.5", maxValue: "3", category: "아이템/드롭/채집", note: "현재 3.0 = 슬라이더 최댓값." },
  { envKey: "COLLECTION_OBJECT_HP_RATE", iniKey: "CollectionObjectHpRate", koName: "채집물 내구도 배율", explanation: "낮을수록 나무·바위를 적게 때려도 캐진다.", type: "float", defaultValue: "1.0", minValue: "0.5", maxValue: "3", category: "아이템/드롭/채집" },
  { envKey: "COLLECTION_OBJECT_RESPAWN_SPEED_RATE", iniKey: "CollectionObjectRespawnSpeedRate", koName: "채집물 재생성 간격", explanation: "값이 작을수록 자원이 빨리 다시 생긴다. (이름과 반대로 '간격')", type: "float", defaultValue: "1.0", minValue: "0.5", maxValue: "3", category: "아이템/드롭/채집", note: "현재 0.3은 슬라이더 하한 미만(ini 전용) — 매우 빠른 재생성." },
  { envKey: "ENEMY_DROP_ITEM_RATE", iniKey: "EnemyDropItemRate", koName: "적 드롭 수량 배율", explanation: "높을수록 적·팰 처치 시 더 많은 전리품이 나온다.", type: "float", defaultValue: "1.0", minValue: "0.5", maxValue: "3", category: "아이템/드롭/채집" },
  { envKey: "EQUIPMENT_DURABILITY_DAMAGE_RATE", iniKey: "EquipmentDurabilityDamageRate", koName: "장비 내구도 소모", explanation: "낮을수록 장비가 천천히 닳는다. 0이면 안 닳음.", type: "float", defaultValue: "1.0", minValue: "0", maxValue: "5", category: "아이템/드롭/채집", note: "현재 0.1 = 거의 안 닳음." },
  { envKey: "DROP_ITEM_ALIVE_MAX_HOURS", iniKey: "DropItemAliveMaxHours", koName: "떨어진 아이템 유지시간", explanation: "바닥 아이템이 사라지기까지의 시간(시간 단위).", type: "float", defaultValue: "1.0", minValue: "0", maxValue: "24", category: "아이템/드롭/채집", note: "ini 전용(UI 슬라이더 없음). 상한 24는 편의상 값." },
  { envKey: "DROP_ITEM_MAX_NUM", iniKey: "DropItemMaxNum", koName: "필드 아이템 최대 수", explanation: "월드에 동시에 존재 가능한 바닥 아이템 최대 개수(높을수록 서버 부하↑).", type: "int", defaultValue: "3000", minValue: "0", maxValue: "5000", category: "아이템/드롭/채집" },
  { envKey: "DROP_ITEM_MAX_NUM_UNKO", iniKey: "DropItemMaxNum_UNKO", koName: "배설물 최대 수", explanation: "월드 내 배설물(UNKO) 최대 개수.", type: "int", defaultValue: "100", minValue: "0", maxValue: "5000", category: "아이템/드롭/채집", note: "현재 1000은 기본(100)보다 높게 설정됨." },
  { envKey: "SUPPLY_DROP_SPAN", iniKey: "SupplyDropSpan", koName: "보급 물자 간격(분)", explanation: "값이 작을수록 보급(운석) 드롭이 더 자주 떨어진다.", type: "int", defaultValue: "180", minValue: "1", maxValue: "999", category: "아이템/드롭/채집", note: "분 단위, 기본 180(3시간). 현재 15 = 15분마다(매우 잦음)." },

  // ── 거점/건축 ──
  { envKey: "BASE_CAMP_MAX_NUM", iniKey: "BaseCampMaxNum", koName: "서버 전체 최대 거점 수", explanation: "맵 전체(모든 길드 합산) 거점 총 개수 상한.", type: "int", defaultValue: "128", minValue: "", maxValue: "1024", category: "거점/건축", note: "서버 설정 전용(UI 슬라이더 없음). 상한 1024는 실용적 권장값(공식 하드캡 미명시)." },
  { envKey: "BASE_CAMP_MAX_NUM_IN_GUILD", iniKey: "BaseCampMaxNumInGuild", koName: "길드당 최대 거점 수", explanation: "한 길드가 동시에 소유 가능한 거점 수.", type: "int", defaultValue: "4", minValue: "1", maxValue: "10", category: "거점/건축", note: "문서상 최댓값 10 — 현재 30은 상한 초과 설정(서버 부하↑)." },
  { envKey: "BASE_CAMP_WORKER_MAX_NUM", iniKey: "BaseCampWorkerMaxNum", koName: "거점당 최대 작업 팰 수", explanation: "한 거점에 배치 가능한 일꾼 팰 최대 수.", type: "int", defaultValue: "15", minValue: "1", maxValue: "50", category: "거점/건축", note: "슬라이더 1~50. 현재 50 = 최댓값. (구 오타 변수 …MAXNUM 은 무시됨)" },
  { envKey: "BUILD_OBJECT_DAMAGE_RATE", iniKey: "BuildObjectDamageRate", koName: "건축물 피해 배율", explanation: "높을수록 건축물이 쉽게 파괴된다. 0이면 사실상 무적.", type: "float", defaultValue: "1.0", minValue: "0.1", maxValue: "3.0", category: "거점/건축" },
  { envKey: "BUILD_OBJECT_DETERIORATION_DAMAGE_RATE", iniKey: "BuildObjectDeteriorationDamageRate", koName: "건축물 노후화 속도", explanation: "높을수록 거점 밖 건축물이 빨리 낡는다. 0이면 노후화 없음.", type: "float", defaultValue: "1.0", minValue: "0", maxValue: "10", category: "거점/건축" },

  // ── 길드/PvP/인원/토글 ──
  { envKey: "PLAYERS", iniKey: "ServerPlayerMaxNum", koName: "서버 최대 접속 인원", explanation: "동시 접속 가능한 최대 플레이어 수.", type: "int", defaultValue: "32", minValue: "1", maxValue: "32", category: "길드/PvP/인원/토글", note: "엔진 하드캡 32명. 게임 기본 32, 도커 이미지 기본 16. 현재 16." },
  { envKey: "COOP_PLAYER_MAX_NUM", iniKey: "CoopPlayerMaxNum", koName: "협동 플레이 최대 인원", explanation: "로컬 초대형 코옵 세션 최대 인원(데디서버 실효 제한은 아님).", type: "int", defaultValue: "4", minValue: "1", maxValue: "32", category: "길드/PvP/인원/토글", note: "데디서버에선 실제 제한은 서버 최대 인원. 상한 32는 참고값." },
  { envKey: "GUILD_PLAYER_MAX_NUM", iniKey: "GuildPlayerMaxNum", koName: "길드 최대 인원", explanation: "한 길드에 속할 수 있는 최대 인원.", type: "int", defaultValue: "20", minValue: "1", maxValue: "100", category: "길드/PvP/인원/토글", note: "실제 동시 접속은 서버 최대 인원(32)에 제한." },
  { envKey: "IS_PVP", iniKey: "bIsPvP", koName: "PvP 활성화", explanation: "켜면 플레이어 간 전투가 허용된다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "ENABLE_PLAYER_TO_PLAYER_DAMAGE", iniKey: "bEnablePlayerToPlayerDamage", koName: "플레이어 간 데미지", explanation: "켜면 플레이어끼리 직접 피해를 준다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "ENABLE_FRIENDLY_FIRE", iniKey: "bEnableFriendlyFire", koName: "아군 오사(팀킬)", explanation: "켜면 같은 편에게도 피해가 들어간다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "DEATH_PENALTY", iniKey: "DeathPenalty", koName: "사망 페널티", explanation: "사망 시 잃는 대상. None=없음 → All=아이템·장비·동행 팰까지.", type: "enum", defaultValue: "All", minValue: "", maxValue: "None / Item / ItemAndEquipment / All", category: "길드/PvP/인원/토글", note: "게임 기본 All, 도커 기본 Item. 현재 None(손실 없음)." },
  { envKey: "ENABLE_INVADER_ENEMY", iniKey: "bEnableInvaderEnemy", koName: "습격 이벤트", explanation: "켜면 거점을 습격하는 침입자가 출현한다.", type: "bool", defaultValue: "True", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "ENABLE_FAST_TRAVEL", iniKey: "bEnableFastTravel", koName: "빠른 이동", explanation: "켜면 발견한 지점으로 순간이동할 수 있다.", type: "bool", defaultValue: "True", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "ENABLE_NON_LOGIN_PENALTY", iniKey: "bEnableNonLoginPenalty", koName: "미접속 페널티", explanation: "켜면 오래 접속 안 한 플레이어에게 페널티가 적용된다.", type: "bool", defaultValue: "True", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "EXIST_PLAYER_AFTER_LOGOUT", iniKey: "bExistPlayerAfterLogout", koName: "로그아웃 후 캐릭터 잔류", explanation: "켜면 로그아웃해도 캐릭터가 월드에 남는다(공격 대상 가능).", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "AUTO_RESET_GUILD_NO_ONLINE_PLAYERS", iniKey: "bAutoResetGuildNoOnlinePlayers", koName: "무접속 길드 자동해체", explanation: "켜면 아무도 접속 안 하는 길드의 건축물·거점 팰이 자동 삭제된다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "AUTO_RESET_GUILD_TIME_NO_ONLINE_PLAYERS", iniKey: "AutoResetGuildTimeNoOnlinePlayers", koName: "길드 자동해체 시간(시간)", explanation: "전원 미접속이 이 시간 이상 지속되면 길드가 초기화된다.", type: "float", defaultValue: "72.0", minValue: "0", maxValue: "8760", category: "길드/PvP/인원/토글", note: "위 자동해체가 켜져 있을 때만 작동. 기본 72시간(3일)." },
  { envKey: "CAN_PICKUP_OTHER_GUILD_DEATH_PENALTY_DROP", iniKey: "bCanPickupOtherGuildDeathPenaltyDrop", koName: "타 길드 사망 드롭 습득", explanation: "켜면 다른 길드원이 죽고 떨군 아이템을 누구나 주울 수 있다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "ENABLE_DEFENSE_OTHER_GUILD_PLAYER", iniKey: "bEnableDefenseOtherGuildPlayer", koName: "타 길드 거점 공방", explanation: "켜면 타 길드가 거점 건축물을 공격할 수 있어 거점 공방이 활성화된다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "ENABLE_AIM_ASSIST_KEYBOARD", iniKey: "bEnableAimAssistKeyboard", koName: "에임 어시스트(키보드)", explanation: "켜면 키보드·마우스에도 조준 보정이 적용된다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "ENABLE_AIM_ASSIST_PAD", iniKey: "bEnableAimAssistPad", koName: "에임 어시스트(패드)", explanation: "켜면 게임패드에 조준 보정이 적용된다.", type: "bool", defaultValue: "True", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글" },
  { envKey: "IS_START_LOCATION_SELECT_BY_MAP", iniKey: "bIsStartLocationSelectByMap", koName: "시작 위치 지도 선택", explanation: "켜면 접속 시 지도에서 시작 지점을 직접 고를 수 있다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "길드/PvP/인원/토글", note: "1.0 기준 기본 False(얼리액세스 시절엔 True). 현재 True." },

  // ── 이하 34개 항목: 2026-07-19 공식 문서(docs.palworldgame.com/settings-and-operation/configuration)
  // + thijsvanloef/palworld-server-docker README(이 배포가 실제로 쓰는 이미지, env→ini 매핑의 1차 근거) 교차검증으로 추가.
  // 대부분 min/max 슬라이더 범위는 공식 문서에 없어 확인되지 않음(note 에 "범위 미확인" 명시, 추측 안 함).
  // 문서에는 있으나 이 docker 이미지가 지원하는 환경변수가 없는 설정(AdditionalDropItem*, BlockRespawnTime,
  // DenyTechnologyList, GuildRejoinCooldownMinutes, MonsterFarmActionSpeedRate, RespawnPenalty*,
  // bAllowEnhanceStat_*, bDisplayPvPItemNumOnWorldMap_*, bEnableFastTravelOnlyBaseCamp, bEnableVoiceChat,
  // bCharacterRecreateInHardcore, VoiceChatMax/ZeroVolumeDistance, bIsShowJoinLeftMessage,
  // bEnableBuildingPlayerUIdDisplay 등)는 이 ConfigMap 방식으로는 설정할 수 없어 제외했다.
  // ADMIN_PASSWORD/SERVER_PASSWORD 는 민감정보라 참조 테이블에 넣지 않고 HIDE_KEYS 로 감췄다(settings/route.ts).

  // ── 성능 ──
  { envKey: "MAX_BUILDING_LIMIT_NUM", iniKey: "MaxBuildingLimitNum", koName: "플레이어당 건축물 수 제한", explanation: "한 플레이어가 지을 수 있는 건축물 총 개수 상한. 0이면 무제한.", type: "int", defaultValue: "0", minValue: "", maxValue: "", category: "성능", note: "범위 미확인(공식 문서에 설명만 있음)." },
  { envKey: "SERVER_REPLICATE_PAWN_CULL_DISTANCE", iniKey: "ServerReplicatePawnCullDistance", koName: "팰 동기화 거리(cm)", explanation: "플레이어로부터 이 거리 밖의 팰은 서버가 동기화를 생략해 부하를 줄인다. 낮출수록 부하는 줄지만 먼 팰이 안 보일 수 있다.", type: "int", defaultValue: "15000", minValue: "5000", maxValue: "15000", category: "성능", note: "공식 문서에 최소 5000~최대 15000 명시." },
  { envKey: "ITEM_CONTAINER_FORCE_MARK_DIRTY_INTERVAL", iniKey: "ItemContainerForceMarkDirtyInterval", koName: "컨테이너 강제 동기화 주기(초)", explanation: "상자 등 아이템 컨테이너 UI 를 열어둔 동안 강제로 다시 동기화하는 주기.", type: "float", defaultValue: "1.0", minValue: "", maxValue: "", category: "성능", note: "범위 미확인." },
  { envKey: "PHYSICS_ACTIVE_DROP_ITEM_MAX_NUM", iniKey: "PhysicsActiveDropItemMaxNum", koName: "물리 연산 드롭 아이템 최대 수", explanation: "물리 시뮬레이션이 적용되는 바닥 드롭 아이템의 최대 개수.", type: "int", defaultValue: "-1", minValue: "", maxValue: "", category: "성능", note: "기본값 -1(무제한으로 추정) — 정확한 의미·범위는 공식 미확인." },

  // ── 네트워크/운영 ──
  { envKey: "SERVER_NAME", iniKey: "ServerName", koName: "서버 이름", explanation: "서버 목록/접속창에 표시되는 서버 이름.", type: "string", defaultValue: "", minValue: "", maxValue: "", category: "네트워크/운영" },
  { envKey: "SERVER_DESCRIPTION", iniKey: "ServerDescription", koName: "서버 설명", explanation: "서버 목록에 표시되는 소개 문구.", type: "string", defaultValue: "", minValue: "", maxValue: "", category: "네트워크/운영" },
  { envKey: "PUBLIC_IP", iniKey: "PublicIP", koName: "공개 IP (커뮤니티 서버용)", explanation: "커뮤니티 서버 목록에 노출할 외부 IP를 직접 지정. 보통 비워두면 자동 감지.", type: "string", defaultValue: "", minValue: "", maxValue: "", category: "네트워크/운영" },
  { envKey: "PUBLIC_PORT", iniKey: "PublicPort", koName: "공개 포트 (커뮤니티 서버용)", explanation: "커뮤니티 서버 목록에 노출할 외부 포트를 직접 지정.", type: "int", defaultValue: "", minValue: "", maxValue: "", category: "네트워크/운영" },
  { envKey: "RCON_ENABLED", iniKey: "RCONEnabled", koName: "RCON 활성화", explanation: "켜면 RCON(원격 콘솔) 프로토콜로 서버 명령을 실행할 수 있다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "네트워크/운영" },
  { envKey: "RCON_PORT", iniKey: "RCONPort", koName: "RCON 포트", explanation: "RCON 접속에 사용하는 포트 번호.", type: "int", defaultValue: "25575", minValue: "", maxValue: "", category: "네트워크/운영" },
  { envKey: "REST_API_ENABLED", iniKey: "RESTAPIEnabled", koName: "REST API 활성화", explanation: "켜면 이 문서(/swagger)가 다루는 REST API(기본 포트 8212)가 열린다.", type: "bool", defaultValue: "True", minValue: "", maxValue: "True/False", category: "네트워크/운영" },
  { envKey: "REST_API_PORT", iniKey: "RESTAPIPort", koName: "REST API 포트", explanation: "REST API 가 열리는 포트 번호.", type: "int", defaultValue: "8212", minValue: "", maxValue: "", category: "네트워크/운영" },
  { envKey: "ENABLE_GAMEDATA_API", iniKey: "", koName: "game-data API 활성화", explanation: "REST API의 /v1/api/game-data(월드 액터 스냅샷) 엔드포인트 노출 여부.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "네트워크/운영", note: "docker 이미지 전용 플래그로 보이며 PalWorldSettings.ini 대응 키는 확인되지 않음." },
  { envKey: "CROSSPLAY_PLATFORMS", iniKey: "CrossplayPlatforms", koName: "크로스플레이 허용 플랫폼", explanation: "접속을 허용할 플랫폼 목록(구 AllowConnectPlatform 대체).", type: "string", defaultValue: "(Steam,Xbox,PS5,Mac)", minValue: "", maxValue: "", category: "네트워크/운영" },
  { envKey: "REGION", iniKey: "Region", koName: "서버 지역", explanation: "서버 목록에 표시되는 지역 정보.", type: "string", defaultValue: "", minValue: "", maxValue: "", category: "네트워크/운영" },
  { envKey: "USEAUTH", iniKey: "bUseAuth", koName: "계정 인증 사용", explanation: "켜면 플랫폼 계정 인증을 거쳐야 접속할 수 있다. 끄면 인증 없이 접속 가능(보안 위험).", type: "bool", defaultValue: "True", minValue: "", maxValue: "True/False", category: "네트워크/운영" },
  { envKey: "SHOW_PLAYER_LIST", iniKey: "bShowPlayerList", koName: "플레이어 목록 공개", explanation: "켜면 ESC 메뉴에서 접속자 목록을 볼 수 있다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "네트워크/운영" },
  { envKey: "CHAT_POST_LIMIT_PER_MINUTE", iniKey: "ChatPostLimitPerMinute", koName: "분당 채팅 전송 제한", explanation: "플레이어 1인이 1분간 보낼 수 있는 채팅 메시지 수.", type: "int", defaultValue: "30", minValue: "", maxValue: "", category: "네트워크/운영", note: "범위 미확인." },
  { envKey: "ALLOW_CLIENT_MOD", iniKey: "bAllowClientMod", koName: "클라이언트 모드 허용", explanation: "켜면 모드를 설치한 클라이언트의 접속을 허용한다.", type: "bool", defaultValue: "True", minValue: "", maxValue: "True/False", category: "네트워크/운영" },
  { envKey: "LOG_FORMAT_TYPE", iniKey: "LogFormatType", koName: "로그 포맷", explanation: "서버 로그 출력 형식.", type: "string", defaultValue: "default", minValue: "", maxValue: "", category: "네트워크/운영", note: "공식 REST 문서상 ini 값은 Text/Json 로 보이나 docker 기본값 표기(\"default\")와 표현이 달라 정확한 허용값은 미확인." },

  // ── 월드/기타 ──
  { envKey: "DIFFICULTY", iniKey: "Difficulty", koName: "난이도", explanation: "서버 전체 난이도 프리셋. 아래 개별 배율 설정으로 세부 조정하는 것이 일반적이라 대부분 기본값으로 둔다.", type: "string", defaultValue: "None", minValue: "", maxValue: "", category: "월드/기타", note: "허용값(예: Normal/Hard 등) 공식 미확인." },
  { envKey: "RANDOMIZER_TYPE", iniKey: "RandomizerType", koName: "야생 팰 랜덤화 모드", explanation: "None=랜덤화 없음, Region=지역별 범위 내 랜덤, All=완전 랜덤.", type: "enum", defaultValue: "None", minValue: "", maxValue: "None/Region/All", category: "월드/기타", note: "허용값은 공식 문서로 확인." },
  { envKey: "RANDOMIZER_SEED", iniKey: "RandomizerSeed", koName: "랜덤화 시드", explanation: "팰 스폰 랜덤화에 사용하는 시드 값.", type: "string", defaultValue: "", minValue: "", maxValue: "", category: "월드/기타" },
  { envKey: "IS_RANDOMIZER_PAL_LEVEL_RANDOM", iniKey: "bIsRandomizerPalLevelRandom", koName: "팰 레벨 완전 랜덤화", explanation: "켜면 야생 팰 레벨이 완전히 무작위. 끄면 지역별 레벨 범위 내에서만 랜덤.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "월드/기타" },
  { envKey: "IS_MULTIPLAY", iniKey: "bIsMultiplay", koName: "멀티플레이 활성화", explanation: "여러 플레이어의 동시 접속을 허용할지 여부.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "월드/기타" },
  { envKey: "HARDCORE", iniKey: "bHardcore", koName: "하드코어 모드", explanation: "켜면 사망 시 리스폰이 불가능해진다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "월드/기타" },
  { envKey: "PAL_LOST", iniKey: "bPalLost", koName: "사망 시 팰 영구 손실", explanation: "켜면 플레이어 사망 시 동행 팰을 영구히 잃는다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "월드/기타" },
  { envKey: "INVISIBLE_OTHER_GUILD_BASE_CAMP_AREA_FX", iniKey: "bInvisibleOtherGuildBaseCampAreaFX", koName: "타 길드 거점 영역 표시 숨김", explanation: "켜면 다른 길드 거점의 영역 경계 이펙트가 보이지 않는다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "월드/기타" },
  { envKey: "BUILD_AREA_LIMIT", iniKey: "bBuildAreaLimit", koName: "건축 구역 제한", explanation: "켜면 패스트 트래블 지점 등 특정 구역 근처 건축을 막는다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "월드/기타" },
  { envKey: "ALLOW_GLOBAL_PALBOX_EXPORT", iniKey: "bAllowGlobalPalboxExport", koName: "글로벌 팰박스 내보내기 허용", explanation: "켜면 글로벌 팰박스로 팰을 저장(내보내기)할 수 있다.", type: "bool", defaultValue: "True", minValue: "", maxValue: "True/False", category: "월드/기타" },
  { envKey: "ALLOW_GLOBAL_PALBOX_IMPORT", iniKey: "bAllowGlobalPalboxImport", koName: "글로벌 팰박스 가져오기 허용", explanation: "켜면 글로벌 팰박스에서 팰을 불러올 수 있다.", type: "bool", defaultValue: "False", minValue: "", maxValue: "True/False", category: "월드/기타" },
  { envKey: "AUTO_SAVE_SPAN", iniKey: "AutoSaveSpan", koName: "자동 저장 간격(초)", explanation: "월드 자동 저장 주기.", type: "float", defaultValue: "30.0", minValue: "", maxValue: "", category: "월드/기타", note: "범위 미확인. ini 키 표기는 docker 변수명 기준 추정(공식 미확인)." },
  { envKey: "ENABLE_PREDATOR_BOSS_PAL", iniKey: "EnablePredatorBossPal", koName: "포식자(보스) 팰 활성화", explanation: "켜면 포식자(Predator) 개체가 보스급 팰로 출현할 수 있다.", type: "bool", defaultValue: "True", minValue: "", maxValue: "True/False", category: "월드/기타" },
  { envKey: "ITEM_CORRUPTION_MULTIPLIER", iniKey: "ItemCorruptionMultiplier", koName: "아이템 부식 속도 배율", explanation: "아이템이 부식(품질 저하)되는 속도의 배율.", type: "float", defaultValue: "1.0", minValue: "", maxValue: "", category: "월드/기타", note: "범위 미확인." },
];

export const REF_BY_KEY: Record<string, SettingRef> = Object.fromEntries(
  SETTINGS_REFERENCE.map((s) => [s.envKey, s]),
);

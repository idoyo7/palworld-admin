// 팰월드 데디케이드 서버 REST API v1 의 OpenAPI 3.0 스펙.
// 출처: https://docs.palworldgame.com/api/rest-api/palwold-rest-api/ (버전 1.0.0, 각 엔드포인트 하위 문서)
// 추측으로 스키마를 만들지 않고 공식 문서에 기재된 필드만 반영했다.
//
// servers 를 /api/palworld(서버사이드 프록시)로 지정해 Swagger UI 의 "Try it out" 이
// 실제 팰월드 서버로 (Basic Auth 자동 주입 후) 요청을 보낼 수 있게 한다.

export const palworldOpenApiSpec: Record<string, unknown> = {
  openapi: "3.0.3",
  info: {
    title: "Palworld Dedicated Server REST API",
    version: "1.0.0",
    description:
      "팰월드 데디케이드 서버가 제공하는 REST API v1 문서입니다. " +
      "이 문서는 palworld-admin 서버 프록시(`/api/palworld/*`)를 경유하며, " +
      "Basic Auth 인증은 서버사이드에서 자동으로 주입되므로 별도 인증 입력 없이 " +
      "'Try it out' 으로 실제 서버에 요청할 수 있습니다. " +
      "원본 문서: https://docs.palworldgame.com/api/rest-api/palwold-rest-api/ " +
      "⚠️ shutdown/stop 등 일부 엔드포인트는 서버를 즉시 종료시키는 파괴적 동작입니다 — 실행에 주의하세요.",
  },
  servers: [
    {
      url: "/api/palworld",
      description: "palworld-admin 프록시 (Basic Auth 자동 주입, 허용된 엔드포인트만 전달)",
    },
  ],
  tags: [
    { name: "정보 조회", description: "서버/플레이어/설정/성능 정보를 읽어오는 GET 엔드포인트" },
    { name: "플레이어 관리", description: "플레이어 추방/차단 등 관리 작업" },
    { name: "서버 제어", description: "공지, 저장, 종료 등 서버 제어 작업 (일부 파괴적)" },
  ],
  paths: {
    "/info": {
      get: {
        tags: ["정보 조회"],
        summary: "서버 정보 조회 (Get the server info)",
        description: "서버 버전, 이름, 설명, 월드 GUID 를 반환합니다.",
        operationId: "getInfo",
        responses: {
          "200": {
            description: "성공",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ServerInfo" },
                example: {
                  version: "v0.1.5.0",
                  servername: "Palworld example Server",
                  description: "This is a Palworld server.",
                  worldguid: "A7E97BAA767DB9029EF013BB71E993A0",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/players": {
      get: {
        tags: ["정보 조회"],
        summary: "플레이어 목록 조회 (Get player list)",
        description: "현재 접속 중인 플레이어 목록을 반환합니다.",
        operationId: "getPlayers",
        responses: {
          "200": {
            description: "성공",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PlayersResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/settings": {
      get: {
        tags: ["정보 조회"],
        summary: "서버 설정 조회 (Get the server settings)",
        description: "현재 적용된 서버 설정(난이도, 배율, PvP 여부 등)을 반환합니다. 읽기 전용입니다.",
        operationId: "getSettings",
        responses: {
          "200": {
            description: "성공",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ServerSettings" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/metrics": {
      get: {
        tags: ["정보 조회"],
        summary: "서버 성능 지표 조회 (Get the server metrics)",
        description: "서버 FPS, 접속자 수, 인게임 일수 등 실시간 성능 지표를 반환합니다.",
        operationId: "getMetrics",
        responses: {
          "200": {
            description: "성공",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Metrics" },
                example: {
                  serverfps: 57,
                  currentplayernum: 10,
                  serverframetime: 16.7671,
                  maxplayernum: 32,
                  uptime: 3600,
                  basecampnum: 32,
                  days: 1,
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/game-data": {
      get: {
        tags: ["정보 조회"],
        summary: "월드 액터 스냅샷 조회 (Get world actor snapshot)",
        description:
          "플레이어/팰/거점 등 월드 내 모든 액터의 스냅샷을 반환합니다. " +
          "⚠️ 월드 액터 수에 따라 응답이 매우 커질 수 있습니다.",
        operationId: "getGameData",
        responses: {
          "200": {
            description: "성공",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GameDataResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/announce": {
      post: {
        tags: ["서버 제어"],
        summary: "공지 메시지 전송 (Announce message)",
        description: "접속 중인 모든 플레이어에게 공지 메시지를 표시합니다.",
        operationId: "postAnnounce",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AnnounceRequest" },
              example: { message: "Server will restart in 10 minutes" },
            },
          },
        },
        responses: {
          "200": { description: "공지 전송 완료 (The message was announced.)" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/kick": {
      post: {
        tags: ["플레이어 관리"],
        summary: "플레이어 추방 (Kick player)",
        description: "지정한 플레이어를 서버에서 추방합니다.",
        operationId: "postKick",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/KickRequest" },
            },
          },
        },
        responses: {
          "200": { description: "추방 완료 (The player was kicked)" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/ban": {
      post: {
        tags: ["플레이어 관리"],
        summary: "플레이어 차단 (Ban player)",
        description: "지정한 플레이어를 서버에서 차단(밴)합니다.",
        operationId: "postBan",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BanRequest" },
            },
          },
        },
        responses: {
          "200": { description: "차단 완료 (The player was banned.)" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/unban": {
      post: {
        tags: ["플레이어 관리"],
        summary: "플레이어 차단 해제 (Unban player)",
        description: "차단된 플레이어의 접속을 다시 허용합니다.",
        operationId: "postUnban",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UnbanRequest" },
            },
          },
        },
        responses: {
          "200": { description: "차단 해제 완료 (The player was unbanned.)" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/save": {
      post: {
        tags: ["서버 제어"],
        summary: "월드 저장 (Save the world)",
        description: "현재 월드 상태를 즉시 저장합니다. 요청 본문은 필요 없습니다.",
        operationId: "postSave",
        responses: {
          "200": { description: "저장 완료 (Successfully saved the world.)" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/shutdown": {
      post: {
        tags: ["서버 제어"],
        summary: "서버 종료 예약 (Shutdown the server)",
        description:
          "⚠️ 파괴적 동작 — 지정한 대기 시간(초) 후 서버를 정상 종료합니다. " +
          "접속자가 있는 상태로 실행하면 강제 접속 종료됩니다. 문서 확인 목적상 포함되었으니 실행에 주의하세요.",
        operationId: "postShutdown",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ShutdownRequest" },
              example: { waittime: 60, message: "Server will shutdown soon" },
            },
          },
        },
        responses: {
          "200": { description: "종료 예약됨 (The server will shutdown.)" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/stop": {
      post: {
        tags: ["서버 제어"],
        summary: "서버 강제 종료 (Force stop the server)",
        description:
          "⚠️ 파괴적 동작 — 대기 시간 없이 서버를 즉시 강제 종료합니다. " +
          "저장되지 않은 데이터가 유실될 수 있습니다. 문서 확인 목적상 포함되었으니 실행에 주의하세요.",
        operationId: "postStop",
        responses: {
          "200": { description: "강제 종료됨 (The server force stopped)" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
  },
  components: {
    responses: {
      BadRequest: { description: "잘못된 요청 (Request error)" },
      Unauthorized: { description: "인증 실패 (Unauthorized)" },
    },
    schemas: {
      ServerInfo: {
        type: "object",
        properties: {
          version: { type: "string", description: "서버 버전" },
          servername: { type: "string", description: "서버 이름" },
          description: { type: "string", description: "서버 설명" },
          worldguid: { type: "string", description: "월드 GUID" },
        },
      },
      Player: {
        type: "object",
        properties: {
          name: { type: "string", description: "플레이어 이름" },
          accountName: { type: "string", description: "플랫폼 계정 이름" },
          playerId: { type: "string", description: "플레이어 ID" },
          userId: { type: "string", description: "유저 ID" },
          ip: { type: "string", description: "플레이어 IP" },
          ping: { type: "number", description: "핑" },
          location_x: { type: "number", description: "위치 X" },
          location_y: { type: "number", description: "위치 Y" },
          level: { type: "integer", description: "레벨" },
          building_count: { type: "integer", description: "보유 건축물 수" },
        },
      },
      PlayersResponse: {
        type: "object",
        properties: {
          players: { type: "array", items: { $ref: "#/components/schemas/Player" } },
        },
      },
      ServerSettings: {
        type: "object",
        description:
          "서버 설정값 (읽기 전용 조회). 공식 문서(https://docs.palworldgame.com/api/rest-api/settings/) 기준 " +
          "전체 66개 필드를 반영 — 어떤 옵션이 있고 어떤 범위로 바뀌는지 확인하는 용도로 사용.",
        properties: {
          Difficulty: { type: "string", description: "난이도" },
          DayTimeSpeedRate: { type: "number", description: "낮 시간 흐름 속도 배율" },
          NightTimeSpeedRate: { type: "number", description: "밤 시간 흐름 속도 배율" },
          ExpRate: { type: "number", description: "경험치 획득 배율" },
          PalCaptureRate: { type: "number", description: "팰 포획 성공률 배율" },
          PalSpawnNumRate: { type: "number", description: "팰 출현 수 배율" },
          PalDamageRateAttack: { type: "number", description: "팰 공격 데미지 배율" },
          PalDamageRateDefense: { type: "number", description: "팰 방어(피격) 데미지 배율" },
          PlayerDamageRateAttack: { type: "number", description: "플레이어 공격 데미지 배율" },
          PlayerDamageRateDefense: { type: "number", description: "플레이어 방어(피격) 데미지 배율" },
          PlayerStomachDecreaceRate: { type: "number", description: "플레이어 포만감 감소 속도" },
          PlayerStaminaDecreaceRate: { type: "number", description: "플레이어 스태미나 감소 속도" },
          PlayerAutoHPRegeneRate: { type: "number", description: "플레이어 HP 자동 회복 속도" },
          PlayerAutoHpRegeneRateInSleep: { type: "number", description: "수면 중 플레이어 HP 회복 속도" },
          PalStomachDecreaceRate: { type: "number", description: "팰 포만감 감소 속도" },
          PalStaminaDecreaceRate: { type: "number", description: "팰 스태미나 감소 속도" },
          PalAutoHPRegeneRate: { type: "number", description: "팰 HP 자동 회복 속도" },
          PalAutoHpRegeneRateInSleep: { type: "number", description: "팰박스 대기 중 HP 회복 속도" },
          BuildObjectDamageRate: { type: "number", description: "건축물 피해 배율" },
          BuildObjectDeteriorationDamageRate: { type: "number", description: "건축물 노후화(자연 파손) 속도 배율" },
          CollectionDropRate: { type: "number", description: "채집물 획득량 배율" },
          CollectionObjectHpRate: { type: "number", description: "채집물(나무/광석 등) 내구도 배율" },
          CollectionObjectRespawnSpeedRate: { type: "number", description: "채집물 재생성 속도 배율 (작을수록 빨리 재생)" },
          EnemyDropItemRate: { type: "number", description: "적 처치 시 드롭 아이템 수량 배율" },
          DeathPenalty: { type: "string", description: "사망 페널티 종류 (None/Item/ItemAndEquipment/All)" },
          bEnablePlayerToPlayerDamage: { type: "boolean", description: "플레이어 간 데미지 허용 여부" },
          bEnableFriendlyFire: { type: "boolean", description: "아군 오사(팀킬) 허용 여부" },
          bEnableInvaderEnemy: { type: "boolean", description: "거점 습격 이벤트(침입자) 활성화 여부" },
          bActiveUNKO: { type: "boolean", description: "배설물(UNKO) 기능 활성화 여부" },
          bEnableAimAssistPad: { type: "boolean", description: "게임패드 에임 어시스트 활성화 여부" },
          bEnableAimAssistKeyboard: { type: "boolean", description: "키보드/마우스 에임 어시스트 활성화 여부" },
          DropItemMaxNum: { type: "number", description: "월드 내 최대 드롭 아이템 수" },
          DropItemMaxNum_UNKO: { type: "number", description: "월드 내 최대 배설물(UNKO) 수" },
          BaseCampMaxNum: { type: "number", description: "서버 전체 최대 거점 수" },
          BaseCampWorkerMaxNum: { type: "number", description: "거점당 최대 작업 팰(일꾼) 수" },
          DropItemAliveMaxHours: { type: "number", description: "드롭된 아이템이 사라지기까지의 시간 (시간 단위)" },
          bAutoResetGuildNoOnlinePlayers: { type: "boolean", description: "미접속 길드 자동 초기화 여부" },
          AutoResetGuildTimeNoOnlinePlayers: { type: "number", description: "길드 자동 초기화까지 걸리는 미접속 시간 (시간 단위)" },
          GuildPlayerMaxNum: { type: "number", description: "길드 최대 인원" },
          PalEggDefaultHatchingTime: { type: "number", description: "알 부화 기본 소요 시간 (시간 단위)" },
          WorkSpeedRate: { type: "number", description: "작업(제작/건설/채집) 속도 배율" },
          bIsMultiplay: { type: "boolean", description: "멀티플레이 활성화 여부" },
          bIsPvP: { type: "boolean", description: "PvP 모드 활성화 여부" },
          bCanPickupOtherGuildDeathPenaltyDrop: { type: "boolean", description: "타 길드원의 사망 드롭 아이템 습득 허용 여부" },
          bEnableNonLoginPenalty: { type: "boolean", description: "장기 미접속 페널티 적용 여부" },
          bEnableFastTravel: { type: "boolean", description: "빠른 이동(패스트 트래블) 활성화 여부" },
          bIsStartLocationSelectByMap: { type: "boolean", description: "접속 시 지도에서 시작 위치 선택 가능 여부" },
          bExistPlayerAfterLogout: { type: "boolean", description: "로그아웃 후에도 캐릭터가 월드에 남는지 여부" },
          bEnableDefenseOtherGuildPlayer: { type: "boolean", description: "타 길드의 거점 공격(공방) 허용 여부" },
          CoopPlayerMaxNum: { type: "number", description: "로컬 협동 플레이 최대 인원" },
          ServerPlayerMaxNum: { type: "number", description: "서버 최대 동시 접속 인원" },
          ServerName: { type: "string", description: "서버 이름" },
          ServerDescription: { type: "string", description: "서버 설명" },
          PublicPort: { type: "number", description: "서버 접속 포트" },
          PublicIP: { type: "string", description: "서버 공개 IP" },
          RCONEnabled: { type: "boolean", description: "RCON(원격 콘솔) 활성화 여부" },
          RCONPort: { type: "number", description: "RCON 접속 포트" },
          Region: { type: "string", description: "서버 지역 정보" },
          bUseAuth: { type: "boolean", description: "계정 인증(Auth) 사용 여부" },
          BanListURL: { type: "string", description: "밴 리스트 조회 URL" },
          RESTAPIEnabled: { type: "boolean", description: "REST API 활성화 여부" },
          RESTAPIPort: { type: "number", description: "REST API 포트" },
          bShowPlayerList: { type: "boolean", description: "공개 플레이어 목록 표시 여부" },
          AllowConnectPlatform: { type: "string", description: "접속 허용 플랫폼" },
          bIsUseBackupSaveData: { type: "boolean", description: "저장 데이터 백업 사용 여부" },
          LogFormatType: { type: "string", description: "서버 로그 포맷 형식" },
        },
      },
      Metrics: {
        type: "object",
        properties: {
          serverfps: { type: "integer", description: "서버 FPS" },
          currentplayernum: { type: "integer", description: "현재 접속자 수" },
          serverframetime: { type: "number", description: "서버 프레임 타임 (ms)" },
          maxplayernum: { type: "integer", description: "최대 접속 인원" },
          uptime: { type: "integer", description: "서버 가동 시간 (초)" },
          basecampnum: { type: "integer", description: "거점(베이스캠프) 수" },
          days: { type: "integer", description: "인게임 경과 일수" },
        },
      },
      GameDataActor: {
        type: "object",
        description: "월드 내 액터(플레이어/팰/거점) 스냅샷 항목",
        properties: {
          Type: { type: "string", description: "Character 또는 PalBox" },
          InstanceID: { type: "string" },
          UnitType: { type: "string", description: "Player, OtomoPal, BaseCampPal, WildPal, NPC 중 하나" },
          NickName: { type: "string" },
          TrainerInstanceID: { type: "string", description: "소유자 캐릭터 ID" },
          TrainerNickName: { type: "string" },
          TrainerClass: { type: "string" },
          userid: { type: "string", description: "플레이어인 경우만" },
          ip: { type: "string" },
          level: { type: "integer" },
          HP: { type: "integer" },
          MaxHP: { type: "integer" },
          GuildID: { type: "string" },
          GuildName: { type: "string" },
          Class: { type: "string" },
          Action: { type: "string" },
          AI_Action: { type: "string" },
          LocationX: { type: "number", format: "float" },
          LocationY: { type: "number", format: "float" },
          LocationZ: { type: "number", format: "float" },
          RotationX: { type: "number", format: "float" },
          RotationY: { type: "number", format: "float" },
          RotationZ: { type: "number", format: "float" },
          Stage: { type: "string" },
          IsActive: { type: "string", description: "true/false 문자열" },
        },
      },
      GameDataResponse: {
        type: "object",
        properties: {
          Time: { type: "string", description: "서버 로컬 시각 (YYYY-MM-DD HH:MM:SS)" },
          FPS: { type: "number", format: "float", description: "현재 서버 FPS" },
          AverageFPS: { type: "number", format: "float", description: "평균 서버 FPS" },
          ActorData: { type: "array", items: { $ref: "#/components/schemas/GameDataActor" } },
        },
      },
      AnnounceRequest: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string", description: "전송할 공지 메시지" },
        },
      },
      KickRequest: {
        type: "object",
        required: ["userid"],
        properties: {
          userid: { type: "string", description: "추방할 플레이어의 유저 ID" },
          message: { type: "string", description: "추방 시 표시할 메시지 (선택)" },
        },
      },
      BanRequest: {
        type: "object",
        required: ["userid"],
        properties: {
          userid: { type: "string", description: "차단할 플레이어의 유저 ID" },
          message: { type: "string", description: "차단 시 표시할 메시지 (선택)" },
        },
      },
      UnbanRequest: {
        type: "object",
        required: ["userid"],
        properties: {
          userid: { type: "string", description: "차단 해제할 플레이어의 유저 ID" },
        },
      },
      ShutdownRequest: {
        type: "object",
        required: ["waittime"],
        properties: {
          waittime: { type: "integer", description: "종료까지 대기할 시간 (초)" },
          message: { type: "string", description: "종료 전 표시할 메시지 (선택)" },
        },
      },
    },
  },
};

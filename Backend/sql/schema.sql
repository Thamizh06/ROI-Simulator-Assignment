CREATE TABLE IF NOT EXISTS scenarios (
  id          VARCHAR(26)  PRIMARY KEY,
  name        VARCHAR(191) NOT NULL UNIQUE,
  inputs      JSON         NOT NULL,
  results     JSON         NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id          VARCHAR(26)  PRIMARY KEY,
  email       VARCHAR(254) NOT NULL,
  scenario_id VARCHAR(26),
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lead_scenario FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);

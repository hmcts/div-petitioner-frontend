data "azurerm_key_vault" "div_key_vault" {
  name                = "${local.vaultName}"
  resource_group_name = "${local.vaultName}"
}

data "azurerm_key_vault_secret" "frontend_secret" {
  name      = "frontend-secret"
  vault_uri = "${data.azurerm_key_vault.div_key_vault.vault_uri}"
}

data "azurerm_key_vault_secret" "idam_secret" {
  name      = "idam-secret"
  vault_uri = "${data.azurerm_key_vault.div_key_vault.vault_uri}"
}

data "azurerm_key_vault_secret" "post_code_token" {
  name      = "post-code-token"
  vault_uri = "${data.azurerm_key_vault.div_key_vault.vault_uri}"
}

data "azurerm_key_vault_secret" "session_secret" {
  name      = "session-secret"
  vault_uri = "${data.azurerm_key_vault.div_key_vault.vault_uri}"
}

data "azurerm_key_vault_secret" "redis_secret" {
  name      = "redis-secret"
  vault_uri = "${data.azurerm_key_vault.div_key_vault.vault_uri}"
}

locals {
  aseName                             = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"
  public_hostname                     = "div-pfe-${var.env}.service.${local.aseName}.internal"

  local_env                           = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"

  previewVaultName                    = "${var.reform_team}-aat"
  nonPreviewVaultName                 = "${var.reform_team}-${var.env}"
  vaultName                           = "${(var.env == "preview" || var.env == "spreview") ? local.previewVaultName : local.nonPreviewVaultName}"

  service_auth_provider_url           = "${var.service_auth_provider_url == "" ? "http://${var.idam_s2s_url_prefix}-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.service_auth_provider_url}"

  case_orchestration_service_url      = "${var.case_orchestration_service_url == "" ? "http://div-cos-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.case_orchestration_service_url}"
  evidence_management_client_api_url  = "${var.evidence_management_client_api_url == "" ? "http://div-emca-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.evidence_management_client_api_url}"
  fees_and_payments_url               = "${var.fees_and_payments_url == "" ? "http://div-fps-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.fees_and_payments_url}"
  decree_nisi_frontend_url            = "${var.decree_nisi_frontend_url == "" ? "https://div-dn-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.decree_nisi_frontend_url}"

  status_health_endpoint             = "/status/health"

  asp_name = "${var.env == "prod" ? "div-pfe-prod" : "${var.raw_product}-${var.env}"}"
  asp_rg   = "${var.env == "prod" ? "div-pfe-prod" : "${var.raw_product}-${var.env}"}"

  appinsights_name           = "${var.env == "preview" ? "${var.product}-${var.reform_service_name}-appinsights-${var.env}" : "${var.product}-${var.env}"}"
  appinsights_resource_group = "${var.env == "preview" ? "${var.product}-${var.reform_service_name}-${var.env}" : "${var.product}-${var.env}"}"
}

module "redis-cache" {
  source      = "git@github.com:hmcts/moj-module-redis?ref=master"
  product     = "${var.env != "preview" ? "${var.product}-redis" : "${var.product}-${var.reform_service_name}-redis"}"
  location    = "${var.location}"
  env         = "${var.env}"
  subnetid    = "${data.terraform_remote_state.core_apps_infrastructure.subnet_ids[1]}"
  common_tags = "${var.common_tags}"
}

module "frontend" {
  source                          = "git@github.com:hmcts/moj-module-webapp.git?ref=master"
  product                         = "${var.product}-${var.reform_service_name}"
  location                        = "${var.location}"
  env                             = "${var.env}"
  ilbIp                           = "${var.ilbIp}"
  is_frontend                     = "${var.env != "preview" ? 1: 0}"
  subscription                    = "${var.subscription}"
  appinsights_instrumentation_key = "${var.appinsights_instrumentation_key}"
  additional_host_name            = "${var.env != "preview" ? var.additional_host_name : "null"}"
  https_only                      = "false"
  capacity                        = "${var.capacity}"
  common_tags                     = "${var.common_tags}"
  asp_name                        = "${local.asp_name}"
  asp_rg                          = "${local.asp_rg}"

  app_settings = {
    // Node specific vars
    NODE_ENV  = "${var.node_env}"
    NODE_PATH = "${var.node_path}"

    UV_THREADPOOL_SIZE = "${var.uv_threadpool_size}"
    NODE_CONFIG_DIR    = "${var.node_config_dir}"

    // Logging vars
    REFORM_TEAM         = "${var.reform_team}"
    REFORM_SERVICE_NAME = "${var.reform_service_name}"
    REFORM_ENVIRONMENT  = "${var.env}"

    // Packages
    PACKAGES_NAME        = "${var.packages_name}"
    PACKAGES_PROJECT     = "${var.packages_project}"
    PACKAGES_ENVIRONMENT = "${var.packages_environment}"
    PACKAGES_VERSION     = "${var.packages_version}"

    DEPLOYMENT_ENV = "${var.deployment_env}"

    // Frontend web details
    PUBLIC_HOSTNAME    = "${local.public_hostname}"
    PUBLIC_PROTOCOL    = "${var.public_protocol}"
    DIVORCE_HTTP_PROXY = "${var.http_proxy}"
    no_proxy           = "${var.no_proxy}"

    // Service name
    SERVICE_NAME = "${var.frontend_service_name}"

    // IDAM
    IDAM_API_URL                       = "${var.idam_api_url}"
    IDAM_APP_HEALHCHECK_URL            = "${var.idam_api_url}${var.health_endpoint}"
    IDAM_LOGIN_URL                     = "${var.idam_authentication_web_url}${var.idam_authentication_login_endpoint}"
    IDAM_AUTHENTICATION_HEALHCHECK_URL = "${var.idam_authentication_web_url}${var.health_endpoint}"
    IDAM_SECRET                        = "${data.azurerm_key_vault_secret.idam_secret.value}"

    // Service Auth
    SERVICE_AUTH_PROVIDER_URL             = "${local.service_auth_provider_url}"
    SERVICE_AUTH_PROVIDER_HEALTHCHECK_URL = "${local.service_auth_provider_url}${var.health_endpoint}"
    MICROSERVICE_NAME                     = "${var.s2s_microservice_name}"
    MICROSERVICE_KEY                      = "${data.azurerm_key_vault_secret.frontend_secret.value}"

    // Payments API
    PAYMENT_SERVICE_URL                      = "${var.payment_service_url}"
    PAYMENT_SERVICE_HEALTHCHECK_URL          = "${var.payment_service_url}${var.health_endpoint}"
    PAYMENT_REFERENCE_SERVICE_IDENTIFICATION = "${var.payment_reference_service_id}"

    // Fees API
    FEES_AND_PAYMENTS_URL             = "${local.fees_and_payments_url}"
    FEES_AND_PAYMENTS_HEALTHCHECK_URL = "${local.fees_and_payments_url}${var.health_endpoint}"

    // Post code Lookup
    POST_CODE_URL          = "${var.post_code_url}"
    POST_CODE_ACCESS_TOKEN = "${data.azurerm_key_vault_secret.post_code_token.value}"

    // Redis Cloud
    REDISCLOUD_URL = "redis://ignore:${urlencode(module.redis-cache.access_key)}@${module.redis-cache.host_name}:${module.redis-cache.redis_port}?tls=true"
    USE_AUTH       = "${var.use_auth}"

    // Encryption secrets
    SECRET                    = "${data.azurerm_key_vault_secret.session_secret.value}"
    SESSION_ENCRYPTION_SECRET = "${data.azurerm_key_vault_secret.redis_secret.value}"

    // Evidence Management Client API
    EVIDENCE_MANAGEMENT_CLIENT_API_URL             = "${local.evidence_management_client_api_url}"
    EVIDENCE_MANAGEMENT_CLIENT_API_HEALTHCHECK_URL = "${local.evidence_management_client_api_url}${var.evidence_management_client_api_url == "" ? var.health_endpoint : local.status_health_endpoint}"
    EVIDENCE_MANAGEMENT_CLIENT_API_UPLOAD_ENDPOINT = "${var.evidence_management_client_api_upload_endpoint}"

    // Case Orchestration Service
    CASE_ORCHESTRATION_SERVICE_URL             = "${local.case_orchestration_service_url}${var.case_orchestration_base_path}"
    CASE_ORCHESTRATION_SERVICE_HEALTHCHECK_URL = "${local.case_orchestration_service_url}${var.health_endpoint}"

    // Draft Store API
    CASE_ORCHESTRATION_SERVICE_DRAFT_URL = "${local.case_orchestration_service_url}${var.draft_store_api_base_path}"

    // Decree Nisi Frontend Url
    DECREE_NISI_FRONTEND_URL = "${local.decree_nisi_frontend_url}"

    // Common Court Content
    SMARTSURVEY_FEEDBACK_URL      = "${var.survey_feedback_url}"
    SMARTSURVEY_FEEDBACK_DONE_URL = "${var.survey_feedback_done_url}"
    COURT_PHONENUMBER             = "${var.court_phone_number}"
    COURT_OPENINGHOURS            = "${var.court_opening_hours}"
    COURT_EMAIL                   = "${var.court_email}"

    // HPKP
    HPKP_MAX_AGE = "${var.hpkp_max_age}"
    HPKP_SHAS    = "${var.hpkp_shas}"

    // Google Anayltics
    GOOGLE_ANALYTICS_ID           = "${var.google_analytics_tracking_id}"
    GOOGLE_ANALYTICS_TRACKING_URL = "${var.google_analytics_tracking_url}"

    // Rate Limiter
    RATE_LIMITER_TOTAL  = "${var.rate_limiter_total}"
    RATE_LIMITER_EXPIRE = "${var.rate_limiter_expire}"

    // Specific Court Content
    COURT_EASTMIDLANDS_NAME                 = "${var.court_eastmidlands_name}"
    COURT_EASTMIDLANDS_CITY                 = "${var.court_eastmidlands_city}"
    COURT_EASTMIDLANDS_POBOX                = "${var.court_eastmidlands_pobox}"
    COURT_EASTMIDLANDS_POSTCODE             = "${var.court_eastmidlands_postcode}"
    COURT_EASTMIDLANDS_OPENINGHOURS         = "${var.court_eastmidlands_openinghours}"
    COURT_EASTMIDLANDS_EMAIL                = "${var.court_eastmidlands_email}"
    COURT_EASTMIDLANDS_PHONENUMBER          = "${var.court_eastmidlands_phonenumber}"
    COURT_EASTMIDLANDS_SITEID               = "${var.court_eastmidlands_siteid}"
    COURT_EASTMIDLANDS_WEIGHT               = "${var.court_eastmidlands_weight}"
    COURT_WESTMIDLANDS_NAME                 = "${var.court_westmidlands_name}"
    COURT_WESTMIDLANDS_CITY                 = "${var.court_westmidlands_city}"
    COURT_WESTMIDLANDS_POBOX                = "${var.court_westmidlands_pobox}"
    COURT_WESTMIDLANDS_POSTCODE             = "${var.court_westmidlands_postcode}"
    COURT_WESTMIDLANDS_OPENINGHOURS         = "${var.court_westmidlands_openinghours}"
    COURT_WESTMIDLANDS_EMAIL                = "${var.court_westmidlands_email}"
    COURT_WESTMIDLANDS_PHONENUMBER          = "${var.court_westmidlands_phonenumber}"
    COURT_WESTMIDLANDS_SITEID               = "${var.court_westmidlands_siteid}"
    COURT_WESTMIDLANDS_WEIGHT               = "${var.court_westmidlands_weight}"
    COURT_SOUTHWEST_NAME                    = "${var.court_southwest_name}"
    COURT_SOUTHWEST_CITY                    = "${var.court_southwest_city}"
    COURT_SOUTHWEST_POBOX                   = "${var.court_southwest_pobox}"
    COURT_SOUTHWEST_POSTCODE                = "${var.court_southwest_postcode}"
    COURT_SOUTHWEST_OPENINGHOURS            = "${var.court_southwest_openinghours}"
    COURT_SOUTHWEST_EMAIL                   = "${var.court_southwest_email}"
    COURT_SOUTHWEST_PHONENUMBER             = "${var.court_southwest_phonenumber}"
    COURT_SOUTHWEST_SITEID                  = "${var.court_southwest_siteid}"
    COURT_SOUTHWEST_WEIGHT                  = "${var.court_southwest_weight}"
    COURT_NORTHWEST_NAME                    = "${var.court_northwest_name}"
    COURT_NORTHWEST_ADDRESSNAME             = "${var.court_northwest_addressname}"
    COURT_NORTHWEST_CITY                    = "${var.court_northwest_city}"
    COURT_NORTHWEST_STREET                  = "${var.court_northwest_street}"
    COURT_NORTHWEST_POSTCODE                = "${var.court_northwest_postcode}"
    COURT_NORTHWEST_OPENINGHOURS            = "${var.court_northwest_openinghours}"
    COURT_NORTHWEST_EMAIL                   = "${var.court_northwest_email}"
    COURT_NORTHWEST_PHONENUMBER             = "${var.court_northwest_phonenumber}"
    COURT_NORTHWEST_SITEID                  = "${var.court_northwest_siteid}"
    COURT_NORTHWEST_WEIGHT                  = "${var.court_northwest_weight}"

    SERVICE_CENTRE_NAME                     = "${var.service_centre_name}"
    COURT_SERVICE_CENTRE_NAME               = "${var.court_service_centre_name}"
    COURT_SERVICE_CENTRE_CITY               = "${var.court_service_centre_city}"
    COURT_SERVICE_CENTRE_POBOX              = "${var.court_service_centre_pobox}"
    COURT_SERVICE_CENTRE_POSTCODE           = "${var.court_service_centre_postcode}"
    COURT_SERVICE_CENTRE_OPENINGHOURS       = "${var.court_service_centre_openinghours}"
    COURT_SERVICE_CENTRE_EMAIL              = "${var.court_service_centre_email}"
    COURT_SERVICE_CENTRE_PHONENUMBER        = "${var.court_service_centre_phonenumber}"
    COURT_SERVICE_CENTRE_SITEID             = "${var.court_service_centre_siteid}"
    COURT_SERVICE_CENTRE_WEIGHT             = "${var.court_service_centre_weight}"

    COURT_EASTMIDLANDS_DIVORCE_FACT_RATIO   = "${var.court_eastmidlands_divorce_facts_ratio}"
    COURT_WESTMIDLANDS_DIVORCE_FACT_RATIO   = "${var.court_westmidlands_divorce_facts_ratio}"
    COURT_SOUTHWEST_DIVORCE_FACT_RATIO      = "${var.court_southwest_divorce_facts_ratio}"
    COURT_NORTHWEST_DIVORCE_FACT_RATIO      = "${var.court_northwest_divorce_facts_ratio}"
    DIVORCE_FACTS_RATIO                     = "${replace(jsonencode(var.divorce_facts_ratio), "/\"([0-9]*\\.?[0-9]*)\"/", "$1")}"

    //Service centre facts distribution
    SERVICE_CENTRE_DIVORCE_FACT_RATIO_BEHAVIOUR = "${var.court_service_centre_divorce_facts_ratio["unreasonable-behaviour"]}"
    SERVICE_CENTRE_DIVORCE_FACT_RATIO_2_YEAR_SEPARATION = "${var.court_service_centre_divorce_facts_ratio["separation-2-years"]}"
    SERVICE_CENTRE_DIVORCE_FACT_RATIO_5_YEAR_SEPARATION = "${var.court_service_centre_divorce_facts_ratio["separation-5-years"]}"
    SERVICE_CENTRE_DIVORCE_FACT_RATIO_ADULTERY = "${var.court_service_centre_divorce_facts_ratio["adultery"]}"
    SERVICE_CENTRE_DIVORCE_FACT_RATIO_DESERTION = "${var.court_service_centre_divorce_facts_ratio["desertion"]}"

    // Backwards compatibility envs, to be removed
    EASTMIDLANDS_COURTWEIGHT      = "${var.court_eastmidlands_court_weight}"
    WESTMIDLANDS_COURTWEIGHT      = "${var.court_westmidlands_court_weight}"
    SOUTHWEST_COURTWEIGHT         = "${var.court_southwest_court_weight}"
    NORTHWEST_COURTWEIGHT         = "${var.court_northwest_court_weight}"

    // Feature toggling through config
    FEATURE_IDAM                               = "${var.feature_idam}"
    FEATURE_FULL_PAYMENT_EVENT_DATA_SUBMISSION = "${var.feature_full_payment_event_data_submission}"
    FEATURE_REDIRECT_TO_APPLICATION_SUBMITTED  = "${var.feature_redirect_to_application_submitted}"
    FEATURE_RESPONDENT_CONSENT                 = "${var.feature_respondent_consent}"
    FEATURE_REDIRECT_ON_STATE                  = "${var.feature_redirect_on_state}"
    FEATURE_RELEASE_510                        = "${var.feature_release_510}"
  }
}

provider "vault" {
  address = "https://vault.reform.hmcts.net:6200"
}

data "vault_generic_secret" "frontend_secret" {
  path = "secret/${var.vault_section}/ccidam/service-auth-provider/api/microservice-keys/divorce-frontend"
}

data "vault_generic_secret" "idam_secret" {
  path = "secret/${var.vault_section}/ccidam/idam-api/oauth2/client-secrets/divorce"
}

data "vault_generic_secret" "post_code_token" {
  path = "secret/${var.vault_section}/divorce/postcode/token"
}

data "vault_generic_secret" "session_secret" {
  path = "secret/${var.vault_section}/divorce/session/secret"
}

data "vault_generic_secret" "redis_secret" {
  path = "secret/${var.vault_section}/divorce/session/redis-secret"
}

locals {
  aseName = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"
  public_hostname = "div-frontend-${var.env}.service.${local.aseName}.internal"

  local_env = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"

  service_auth_provider_url = "http://rpe-service-auth-provider-${local.local_env}.service.core-compute-${local.local_env}.internal"
  case_progression_service_url = "http://div-cps-${local.local_env}.service.core-compute-${local.local_env}.internal"
  evidence_management_client_api_url = "http://div-emca-${local.local_env}.service.core-compute-${local.local_env}.internal"
}

module "frontend" {
  source = "git@github.com:hmcts/moj-module-webapp.git?ref=master"
  product = "${var.product}-${var.microservice}"
  location = "${var.location}"
  env = "${var.env}"
  ilbIp = "${var.ilbIp}"
  is_frontend  = true
  subscription = "${var.subscription}"
  additional_host_name = "${var.additional_host_name}"

  app_settings = {
        
    // Node specific vars
    NODE_ENV = "${var.node_env}"
    NODE_PATH = "${var.node_path}"

    UV_THREADPOOL_SIZE = "${var.uv_threadpool_size}"
    NODE_CONFIG_DIR = "${var.node_config_dir}"

    // Logging vars
    REFORM_TEAM = "${var.product}"
    REFORM_SERVICE_NAME = "${var.microservice}"
    REFORM_ENVIRONMENT = "${var.env}"

    // Packages
    PACKAGES_NAME="${var.packages_name}"
    PACKAGES_PROJECT="${var.packages_project}"
    PACKAGES_ENVIRONMENT="${var.packages_environment}"
    PACKAGES_VERSION="${var.packages_version}"

    DEPLOYMENT_ENV="${var.deployment_env}"

    // Frontend web details
    PUBLIC_HOSTNAME ="${local.public_hostname}"
    PUBLIC_PROTOCOL ="${var.public_protocol}"
    DIVORCE_HTTP_PROXY = "${var.http_proxy}"
    no_proxy = "${var.no_proxy}"

    // Service name
    SERVICE_NAME="${var.frontend_service_name}"

    // IDAM
    IDAM_API_URL = "${var.idam_api_url}"
    IDAM_APP_HEALHCHECK_URL ="${var.idam_api_url}${var.health_endpoint}"
    IDAM_LOGIN_URL = "${var.idam_authentication_web_url}${var.idam_authentication_login_endpoint}"
    IDAM_AUTHENTICATION_HEALHCHECK_URL = "${var.idam_authentication_web_url}${var.health_endpoint}"
    IDAM_SECRET = "${data.vault_generic_secret.idam_secret.data["value"]}"

    // Service Auth
    SERVICE_AUTH_PROVIDER_URL = "${local.service_auth_provider_url}"
    SERVICE_AUTH_PROVIDER_HEALTHCHECK_URL = "${local.service_auth_provider_url}${var.health_endpoint}"
    MICROSERVICE_NAME = "${var.s2s_microservice_name}"
    MICROSERVICE_KEY = "${data.vault_generic_secret.frontend_secret.data["value"]}"

    // Payments API
    PAYMENT_SERVICE_URL = "${var.payment_service_url}"
    PAYMENT_SERVICE_HEALTHCHECK_URL = "${var.payment_service_url}${var.health_endpoint}"
    PAYMENT_REFERENCE_SERVICE_IDENTIFICATION = "${var.payment_reference_service_id}"

    // Feature Toggle API
    FEATURE_TOGGLE_API_URL = "${var.feature_toggle_api_url}${var.feature_toggle_api_base_path}"
    FEATURE_TOGGLE_API_HEALHCHECK_URL="${var.feature_toggle_api_url}${var.health_endpoint}"
    jurisdiction = "${var.feature_jurisdiction}"
    newJurisdiction = "${var.feature_new_jurisdiction}"
    idam = "${var.feature_idam}"
    foreignMarriageCerts = "${var.feature_foreign_marriage_certs}"
    courtSouthampton = "${var.feature_court_southamption}"

    // Fees API
    FEE_REGISTER_URL = "${var.fee_register_url}"
    FEE_REGISTER_HEALTHCHECK_URL ="${var.fee_register_url}${var.health_endpoint}"

    // Post code Lookup
    POST_CODE_URL ="${var.post_code_url}"
    POST_CODE_ACCESS_TOKEN = "${data.vault_generic_secret.post_code_token.data["value"]}"

    // Redis Cloud
    REDISCLOUD_URL = "${var.rediscloud_url}"
    USE_AUTH = "${var.use_auth}"

    // Encryption secrets
    SECRET ="${data.vault_generic_secret.session_secret.data["value"]}"
    SESSION_ENCRYPTION_SECRET = "${data.vault_generic_secret.redis_secret.data["value"]}"

    // Evidence Management Client API
    EVIDENCE_MANAGEMENT_CLIENT_API_URL="${local.evidence_management_client_api_url}"
    EVIDENCE_MANAGEMENT_CLIENT_API_HEALTHCHECK_URL= "${local.evidence_management_client_api_url}${var.health_endpoint}"
    EVIDENCE_MANAGEMENT_CLIENT_API_UPLOAD_ENDPOINT= "${var.evidence_management_client_api_upload_endpoint}"

    // Case Progrssion Service
    CASE_PROGRESSION_SERVICE_URL = "${local.case_progression_service_url}${var.transformation_service_base_path}"
    CASE_PROGRESSION_SERVICE_HEALTHCHECK_URL = "${local.case_progression_service_url}${var.health_endpoint}"

    // Draft Store API
    CASE_PROGRESSION_SERVICE_DRAFT_URL = "${local.case_progression_service_url}${var.draft_store_api_base_path}"

    // Common Court Content
    SMARTSURVEY_FEEDBACK_URL = "${var.survey_feedback_url}"
    SMARTSURVEY_FEEDBACK_DONE_URL = "${var.survey_feedback_done_url}"
    COURT_PHONENUMBER = "${var.court_phone_number}"
    COURT_OPENINGHOURS = "${var.court_opening_hours}"
    COURT_EMAIL = "${var.court_email}"

    // HPKP
    HPKP_MAX_AGE = "${var.hpkp_max_age}"
    HPKP_SHAS = "${var.hpkp_shas}"

    // Google Anayltics
    GOOGLE_ANALYTICS_ID= "${var.google_analytics_tracking_id}"
    GOOGLE_ANALYTICS_TRACKING_URL= "${var.google_analytics_tracking_url}"

    // Rate Limiter
    RATE_LIMITER_TOTAL = "${var.rate_limiter_total}"
    RATE_LIMITER_EXPIRE = "${var.rate_limiter_expire}"

    // Backwards compatibility envs, to be removed
    EASTMIDLANDS_COURTWEIGHT = "${var.court_eastmidlands_court_weight}"
    WESTMIDLANDS_COURTWEIGHT = "${var.court_westmidlands_court_weight}"
    SOUTHWEST_COURTWEIGHT = "${var.court_southwest_court_weight}"
    NORTHWEST_COURTWEIGHT = "${var.court_northwest_court_weight}"
  }
}

module "petitioner-frontend-vault" {
  source              = "git@github.com:contino/moj-module-key-vault?ref=master"
  name                = "div-pfe-${var.env}"
  product             = "${var.product}"
  env                 = "${var.env}"
  tenant_id           = "${var.tenant_id}"
  object_id           = "${var.jenkins_AAD_objectId}"
  resource_group_name = "${module.frontend.resource_group_name}"
  product_group_object_id = "68839600-92da-4862-bb24-1259814d1384"
}

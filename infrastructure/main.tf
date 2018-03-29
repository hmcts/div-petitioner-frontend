provider "vault" {
  //  # It is strongly recommended to configure this provider through the
  //  # environment variables described above, so that each user can have
  //  # separate credentials set in the environment.
  //  #
  //  # This will default to using $VAULT_ADDR
  //  # But can be set explicitly
  address = "https://vault.reform.hmcts.net:6200"
}

data "vault_generic_secret" "frontend_secret" {
  path = "secret/${var.vault_section}/ccidam/service-auth-provider/api/microservice-keys/divorce-frontend"
}

data "vault_generic_secret" "idam_secret" {
  path = "secret/${var.vault_section}/ccidam/idam-api/oauth2/client-secrets/divorce"
}

//data "vault_generic_secret" "post_code_token" {
//  path = "secret/${var.vault_section}/divorce/postcode/token"
//}

data "vault_generic_secret" "session_secret" {
  path = "secret/${var.vault_section}/divorce/session/secret"
}

data "vault_generic_secret" "redis_secret" {
  path = "secret/${var.vault_section}/divorce/session/redis-secret"
}

locals {
  aseName = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"
}

module "frontend" {
  source = "git@github.com:hmcts/moj-module-webapp.git?ref=master"
  product = "${var.product}-${var.microservice}"
  location = "${var.location}"
  env = "${var.env}"
  ilbIp = "${var.ilbIp}"
  is_frontend  = true
  subscription = "${var.subscription}"
  additional_host_name = "${var.external_host_name}"

  app_settings = {
    
    // Node specific vars
    NODE_ENV = "${var.node_env}"
    NODE_PATH = "${var.node_path}"

    UV_THREADPOOL_SIZE = "64"
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
    PUBLIC_HOSTNAME ="${var.divorce_frontend_hostname}"
    PUBLIC_PROTOCOL ="${var.divorce_frontend_protocol}"
    PUBLIC_PORT = "${var.divorce_frontend_public_port}"
  	HTTP_PORT = "${var.divorce_frontend_port}"
  	DIVORCE_HTTP_PROXY = "${var.outbound_proxy}"
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
    SERVICE_AUTH_PROVIDER_URL = "${var.service_auth_provider_url}"
    SERVICE_AUTH_PROVIDER_HEALTHCHECK_URL = "${var.service_auth_provider_url}${var.health_endpoint}"
    MICROSERVICE_NAME = "${var.s2s_microservice_name}"
    MICROSERVICE_KEY = "${data.vault_generic_secret.frontend_secret.data["value"]}"

    // Payments API
    PAYMENT_SERVICE_URL = "${var.payments_api_url}"
    PAYMENT_SERVICE_HEALTHCHECK_URL = "${var.payments_api_url}${var.health_endpoint}"
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
    REDISCLOUD_URL = "${var.divorce_redis_url}"
    USE_AUTH = "${var.use_auth}"

    // Encryption secrets
    SECRET ="${data.vault_generic_secret.session_secret.data["value"]}"
    SESSION_ENCRYPTION_SECRET = "${data.vault_generic_secret.redis_secret.data["value"]}"
	
    // Evidence Management Client API
    EVIDENCE_MANAGEMENT_CLIENT_API_URL="${var.evidence_management_client_api_url}"
    EVIDENCE_MANAGEMENT_CLIENT_API_HEALTHCHECK_URL= "${var.evidence_management_client_api_url}${var.status_health_endpoint}"
    EVIDENCE_MANAGEMENT_CLIENT_API_UPLOAD_ENDPOINT= "${var.evidence_management_client_api_upload_endpoint}"

    // Case Progrssion Service
    TRANSFORMATION_SERVICE_URL = "${var.case_progression_service_url}${var.transformation_service_base_path}"
    TRANSOFRMATION_SERVICE_HEALTHCHECK_URL = "${var.case_progression_service_url}${var.status_health_endpoint}"
	
    // Draft Store API
    TRANSFORMATION_SERVICE_DRAFT_URL = "${var.case_progression_service_url}${var.draft_store_api_base_path}"
	
    // Common Court Content
    SMARTSURVEY_FEEDBACK_URL = "${var.survey_feedback_url}"
    SMARTSURVEY_FEEDBACK_DONE_URL = "${var.survey_feedback_done_url}"
    COURT_PHONENUMBER = "${var.court_phone_number}"
    COURT_OPENINGHOURS = "${var.court_opening_hours}"
    COURT_EMAIL = "${var.court_email}"

    // HPKP
    HPKP_MAX_AGE = "${var.hpkp_max_age}"
    HPKP_SHAS = "${var.hpkp_sha256s}"

    // Google Anayltics
    GOOGLE_ANALYTICS_ID= "${var.ga_tracking_id}"
    GOOGLE_ANALYTICS_TRACKING_URL= "${var.ga_tracking_url}"

    // Rate Limiter
    RATE_LIMITER_TOTAL = "${var.rate_limiter_total}"
    RATE_LIMITER_EXPIRE = "${var.rate_limiter_expire}"	
	
    // Specific Court Content - Not in current use, comes from default config
    // COURT_EASTMIDLANDS_PHONE = "${}"
    // COURT_EASTMIDLANDS_NAME = "${}"
    // COURT_EASTMIDLANDS_CITY = "${}"
    // COURT_EASTMIDLANDS_POBOX = "${}"
    // COURT_EASTMIDLANDS_POSTCODE = "${}"
    // COURT_EASTMIDLANDS_OPENINGHOURS = "${}"
    // COURT_EASTMIDLANDS_EMAIL = "${}"
    // COURT_EASTMIDLANDS_PHONENUMBER = "${}"
    // COURT_EASTMIDLANDS_SITEID = "${}"
    // COURT_EASTMIDLANDS_WEIGHT = "${}"
    // COURT_WESTMIDLANDS_NAME = "${}"
    // COURT_WESTMIDLANDS_CITY = "${}"
    // COURT_WESTMIDLANDS_POBOX = "${}"
    // COURT_WESTMIDLANDS_POSTCODE = "${}"
    // COURT_WESTMIDLANDS_OPENINGHOURS = "${}"
    // COURT_WESTMIDLANDS_EMAIL = "${}"
    // COURT_WESTMIDLANDS_PHONENUMBER = "${}"
    // COURT_WESTMIDLANDS_SITEID = "${}"
    // COURT_WESTMIDLANDS_WEIGHT = "${}"
    // COURT_SOUTHWEST_NAME = "${}"
    // COURT_SOUTHWEST_CITY = "${}"
    // COURT_SOUTHWEST_POBOX = "${}"
    // COURT_SOUTHWEST_POSTCODE = "${}"
    // COURT_SOUTHWEST_OPENINGHOURS = "${}"
    // COURT_SOUTHWEST_EMAIL = "${}"
    // COURT_SOUTHWEST_PHONENUMBER = "${}"
    // COURT_SOUTHWEST_SITEID = "${}"
    // COURT_SOUTHWEST_WEIGHT = "${}"
    // COURT_NORTHWEST_NAME = "${}"
    // COURT_NORTHWEST_CITY = "${}"
    // COURT_NORTHWEST_POBOX = "${}"
    // COURT_NORTHWEST_POSTCODE = "${}"
    // COURT_NORTHWEST_OPENINGHOURS = "${}"
    // COURT_NORTHWEST_EMAIL = "${}"
    // COURT_NORTHWEST_PHONENUMBER = "${}"
    // COURT_NORTHWEST_SITEID = "${}"
    // COURT_NORTHWEST_WEIGHT = "${}"
	
    // Backwards compatibility envs, to be removed
    EASTMIDLANDS_COURTWEIGHT = "${var.court_eastmidlands_court_weight}"
    EASTMIDLANDS_COURTWEIGHT = "${var.court_westmidlands_court_weight}"
    EASTMIDLANDS_COURTWEIGHT = "${var.court_southwest_court_weight}"
    EASTMIDLANDS_COURTWEIGHT = "${var.court_northwest_court_weight}"

    // Functional tests
    E2E_FRONTEND_URL = "${var.divorce_frontend_protocol}://${var.divorce_frontend_hostname}"
    E2E_WAIT_FOR_TIMEOUT_VALUE = "${var.e2e_wait_for_timeout}"
    E2E_WAIT_FOR_ACTION_VALUE = "${var.e2e_wait_for_action}"
  }
}

module "petitioner-frontend-vault" {
  source              = "git@github.com:contino/moj-module-key-vault?ref=master"
  name                = "div-frontend-${var.env}"
  product             = "${var.product}"
  env                 = "${var.env}"
  tenant_id           = "${var.tenant_id}"
  object_id           = "${var.jenkins_AAD_objectId}"
  resource_group_name = "${module.frontend.resource_group_name}"
  product_group_object_id = "68839600-92da-4862-bb24-1259814d1384"
}
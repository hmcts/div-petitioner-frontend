provider "vault" {
  //  # It is strongly recommended to configure this provider through the
  //  # environment variables described above, so that each user can have
  //  # separate credentials set in the environment.
  //  #
  //  # This will default to using $VAULT_ADDR
  //  # But can be set explicitly
  address = "https://vault.reform.hmcts.net:6200"
}

data "vault_generic_secret" "s2s_secret" {
  path = "secret/${var.vault_section}/ccidam/service-auth-provider/api/microservice-keys/cmc"
}

data "vault_generic_secret" "draft_store_secret" {
  path = "secret/${var.vault_section}/cmc/draft-store/encryption-secrets/citizen-frontend"
}

data "vault_generic_secret" "postcode-lookup-api-key" {
  path = "secret/${var.vault_section}/cmc/postcode-lookup/api-key"
}

data "vault_generic_secret" "oauth-client-secret" {
  path = "secret/${var.vault_section}/ccidam/idam-api/oauth2/client-secrets/cmc-citizen"
}

data "vault_generic_secret" "staff_email" {
  path = "secret/${var.vault_section}/cmc/claim-store/staff_email"
}

locals {
  aseName = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"
}

module "petitioner-frontend" {
  source = "git@github.com:contino/moj-module-webapp.git"
  product = "${var.product}-${var.microservice}"
  location = "${var.location}"
  env = "${var.env}"
  ilbIp = "${var.ilbIp}"
  is_frontend  = true
  subscription = "${var.subscription}"

  app_settings = {

    PACKAGES_NAME="${}"
    PACKAGES_PROJECT="${}"
    PACKAGES_ENVIRONMENT="${}"
    PACKAGES_VERSION="${}"
    DEPLOYMENT_ENV="${}"

    PUBLIC_HOSTNAME ="${}"
    PUBLIC_PROTOCOL ="${}"

    NODE_ENV="${}"

    //Service name
    SERVICE_NAME="${}"

    // Node specific vars
    NODE_ENV = "${var.node_env}"
    UV_THREADPOOL_SIZE = "64"
    NODE_CONFIG_DIR = "D:\\home\\site\\wwwroot\\config"
    TS_BASE_URL = "./src/main"

    // Logging vars
    REFORM_TEAM = "${var.product}"
    REFORM_SERVICE_NAME = "${var.microservice}"
    REFORM_ENVIRONMENT = "${var.env}"

    // Application vars
    GA_TRACKING_ID = "${var.ga_tracking_id}"
    POSTCODE_LOOKUP_API_KEY = "${data.vault_generic_secret.postcode-lookup-api-key.data["value"]}"

    // IDAM
    IDAM_API_URL = "${var.idam_api_url}"
    IDAM_AUTHENTICATION_HEALHCHECK_URL = "${var.authentication_web_url}"
    IDAM_APP_HEALHCHECK_URL ="${}"

    //Service Auth
    SERVICE_AUTH_PROVIDER_URL = "${}"
    SERVICE_AUTH_PROVIDER_HEALTHCHECK_URL="${}"
    MICROSERVICE_NAME="${}"
    MICROSERVICE_KEY="${}"

    EVIDENCE_MANAGEMENT_CLIENT_API_HEALTHCHECK_URL= "${}"
    EVIDENCE_MANAGEMENT_CLIENT_API_URL="${}"
    EVIDENCE_MANAGEMENT_CLIENT_API_UPLOAD_ENDPOINT= "${}"

    //Payments API
    PAYMENT_SERVICE_URL = "${var.payments_api_url}"
    PAYMENT_SERVICE_HEALTHCHECK_URL="${}"

    //feature toggle.
    FEATURE_TOGGLE_API_URL ="${}"
    FEATURE_TOGGLE_API_HEALHCHECK_URL="${}"

    // Fees API
    FEE_REGISTER_URL = "${var.fees_api_url}"
    FEE_REGISTER_HEALTHCHECK_URL ="${}"

    //Post code.
    POST_CODE_URL ="${}"
    POST_CODE_ACCESS_TOKEN = "${}"

    //Redis Cloud
    REDISCLOUD_URL= "${}"

    SECRET ="${}"
    SESSION_ENCRYPTION_SECRET = "${}"

    // Draft Store API
    TRANSFORMATION_SERVICE_DRAFT_URL = "${var.draft_store_api_url}"
    DRAFT_STORE_SECRET_PRIMARY = "${data.vault_generic_secret.draft_store_secret.data["primary"]}"
    DRAFT_STORE_SECRET_SECONDARY = "${data.vault_generic_secret.draft_store_secret.data["secondary"]}"

    //court
    SMARTSURVEY_FEEDBACK_URL = "${}"
    SMARTSURVEY_FEEDBACK_DONE_URL = "${}"
    COURT_PHONENUMBER = "${}"
    COURT_OPENINGHOURS = "${}"
    COURT_EMAIL = "${}"

    //HPKP
    HPKP_MAX_AGE = "${}"
    HPKP_SHAS = "${}"

    //Google Anayltics
   GOOGLE_ANALYTICS_ID= "${}"
   GOOGLE_ANALYTICS_TRACKING_URL= "${}"

    //Rate Limiter
   RATE_LIMITER_TOTAL = "${}"
   RATE_LIMITER_EXPIRE = "${}"

  }
}

module "petitioner-frontend-vault" {
  source              = "git@github.com:contino/moj-module-key-vault?ref=master"
  name                = "div-petitioner-frontend-${var.env}"
  product             = "${var.product}"
  env                 = "${var.env}"
  tenant_id           = "${var.tenant_id}"
  object_id           = "${var.jenkins_AAD_objectId}"
  resource_group_name = "${module.petitioner-frontend.resource_group_name}"
  product_group_object_id = "68839600-92da-4862-bb24-1259814d1384"
}


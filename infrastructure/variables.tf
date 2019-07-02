// Infrastructural variables

variable "reform_team" {
  default = "div"
}

variable "raw_product" {
  default = "div"
}

variable "capacity" {
  default = "1"
}

variable "instance_size" {
  default = "I2"
}

variable "reform_service_name" {
  default = "pfe"
}

variable "product" {
  type = "string"
}

variable "location" {
  default = "UK South"
}

variable "env" {}

variable "ilbIp" {}

variable "appinsights_instrumentation_key" {
  description = "Instrumentation key of the App Insights instance this webapp should use. Module will create own App Insights resource if this is not provided"
  default     = ""
}

variable "appinsights_location" {
  type        = "string"
  default     = "West Europe"
  description = "Location for Application Insights"
}

variable "deployment_env" {
  type = "string"
}

variable "deployment_path" {
  default = "/opt/divorce/frontend"
}

variable "node_config_dir" {
  // for Unix  // default = "/opt/divorce/frontend/config"

  // for Windows
  default = "D:\\home\\site\\wwwroot\\config"
}

variable "subscription" {}

variable "vault_section" {
  type = "string"
}

// CNP settings
variable "jenkins_AAD_objectId" {
  type        = "string"
  description = "(Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies."
}

variable "tenant_id" {
  description = "(Required) The Azure Active Directory tenant ID that should be used for authenticating requests to the key vault. This is usually sourced from environemnt variables and not normally required to be specified."
}

variable "client_id" {
  description = "(Required) The object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies. This is usually sourced from environment variables and not normally required to be specified."
}

variable "uv_threadpool_size" {
  default = "64"
}

variable "node_env" {
  default = "production"
}

variable "node_path" {
  default = "."
}

variable "additional_host_name" {
  type = "string"
}

// Package details
variable "packages_name" {
  default = "frontend"
}

variable "packages_project" {
  default = "divorce"
}

variable "packages_environment" {
  type = "string"
}

variable "packages_version" {
  default = "-1"
}

variable "public_protocol" {
  default = "https"
}

variable "http_proxy" {
  default = "http://proxyout.reform.hmcts.net:8080/"
}

variable "no_proxy" {
  default = "localhost,127.0.0.0/8,127.0.0.1,127.0.0.1*,local.home,reform.hmcts.net,*.reform.hmcts.net,betaDevBdivorceAppLB.reform.hmcts.net,betaDevBccidamAppLB.reform.hmcts.net,*.internal,*.platform.hmcts.net"
}

variable "google_analytics_tracking_id" {}

variable "google_analytics_tracking_url" {
  default = "http://www.google-analytics.com/collect"
}

variable "use_auth" {
  default = false
}

variable "health_endpoint" {
  default = "/health"
}

variable "idam_authentication_web_url" {
  type = "string"
}

variable "idam_authentication_login_endpoint" {
  default = "/login"
}

variable "idam_api_url" {
  type = "string"
}

variable "idam_client_id" {
  default = "divorce"
}

variable "service_auth_provider_url" {
  default = ""
}

variable "idam_s2s_url_prefix" {
  default = "rpe-service-auth-provider"
}

variable "frontend_service_name" {
  default = "divorce-frontend"
}

variable "s2s_microservice_name" {
  default = "divorce_frontend"
}

variable "case_orchestration_service_url" {
  default = ""
}

variable "case_orchestration_base_path" {
  default = ""
}

variable "draft_store_api_base_path" {
  default = "/draftsapi/version/1"
}

variable "evidence_management_client_api_url" {
  default = ""
}

variable "evidence_management_client_api_upload_endpoint" {
  default = "/emclientapi/version/1/upload"
}

variable "payment_service_url" {
  type = "string"
}

variable "payment_reference_service_id" {
  default = "DIV1"
}

variable "fees_and_payments_url" {
  default = ""
}

variable "post_code_url" {
  default = "https://api.ordnancesurvey.co.uk/places/v1"
}

variable "hpkp_max_age" {
  default = "86400"
}

variable "hpkp_shas" {
  default = "Naw+prhcXSIkbtYJ0t7vAD+Fc92DWL9UZevVfWBvids=,klO23nT2ehFDXCfx3eHTDRESMz3asj1muO+4aIdjiuY=,grX4Ta9HpZx6tSHkmCrvpApTQGo67CYDnvprLg5yRME="
}

variable "rate_limiter_total" {
  default = "3600"
}

variable "rate_limiter_expire" {
  default = "3600000"
}

variable "feature_idam" {
  default = true
}

variable "feature_strategic_pay" {
  default = false
}

variable "survey_feedback_url" {
  default = "http://www.smartsurvey.co.uk/s/0QIL4"
}

variable "survey_feedback_done_url" {
  default = "http://www.smartsurvey.co.uk/s/8RR1T"
}

variable "court_eastmidlands_name" {
  default = "East Midlands Regional Divorce Centre"
}

variable "court_eastmidlands_city" {
  default = "Nottingham"
}

variable "court_eastmidlands_pobox" {
  default = "PO Box 10447"
}

variable "court_eastmidlands_postcode" {
  default = "NG2 9QN"
}

variable "court_eastmidlands_openinghours" {
  default = "Monday to Friday, 8.30am to 5pm"
}

variable "court_eastmidlands_email" {
  default = "eastmidlandsdivorce@hmcts.gsi.gov.uk"
}

variable "court_eastmidlands_phonenumber" {
  default = "0300 303 0642"
}

variable "court_eastmidlands_siteid" {
  default = "AA01"
}

variable "court_westmidlands_name" {
  default = "West Midlands Regional Divorce Centre"
}

variable "court_westmidlands_city" {
  default = "Stoke-on-Trent"
}

variable "court_westmidlands_pobox" {
  default = "PO Box 3650"
}

variable "court_westmidlands_postcode" {
  default = "ST4 9NH"
}

variable "court_westmidlands_openinghours" {
  default = "Monday to Friday, 8.30am to 5pm"
}

variable "court_westmidlands_email" {
  default = "westmidlandsdivorce@hmcts.gsi.gov.uk"
}

variable "court_westmidlands_phonenumber" {
  default = "0300 303 0642"
}

variable "court_westmidlands_siteid" {
  default = "AA02"
}

variable "court_southwest_name" {
  default = "South West Regional Divorce Centre"
}

variable "court_southwest_city" {
  default = "Southampton"
}

variable "court_southwest_pobox" {
  default = "PO Box 1792"
}

variable "court_southwest_postcode" {
  default = "SO15 9GG"
}

variable "court_southwest_openinghours" {
  default = "Monday to Friday, 8.30am to 5pm"
}

variable "court_southwest_email" {
  default = "sw-region-divorce@hmcts.gsi.gov.uk"
}

variable "court_southwest_phonenumber" {
  default = "0300 303 0642"
}

variable "court_southwest_siteid" {
  default = "AA03"
}

variable "court_northwest_name" {
  default = "North West Regional Divorce Centre"
}

variable "court_northwest_addressname" {
  default = "Liverpool Civil & Family Court"
}

variable "court_northwest_city" {
  default = "Liverpool"
}

variable "court_northwest_street" {
  default = "35 Vernon Street"
}

variable "court_northwest_postcode" {
  default = "L2 2BX"
}

variable "court_northwest_openinghours" {
  default = "Monday to Friday, 8.30am to 5pm"
}

variable "court_northwest_email" {
  default = "family@liverpool.countycourt.gsi.gov.uk"
}

variable "court_northwest_phonenumber" {
  default = "0300 303 0642"
}

variable "court_northwest_siteid" {
  default = "AA04"
}

variable "service_centre_name" {
  default = "Courts and Tribunals Service Centre"
}

variable "court_service_centre_name" {
  default = "HMCTS Digital Divorce"
}

variable "court_service_centre_city" {
  default = "Harlow"
}

variable "court_service_centre_pobox" {
  default = "PO Box 12706"
}

variable "court_service_centre_postcode" {
  default = "CM20 9QT"
}

variable "court_service_centre_openinghours" {
  default = "Telephone Enquiries from: 8.30am to 5pm"
}

variable "court_service_centre_email" {
  default = "divorcecase@justice.gov.uk"
}

variable "court_service_centre_phonenumber" {
  default = "0300 303 0642"
}

variable "court_service_centre_siteid" {
  default = "AA07"
}

variable "court_phone_number" {
  default = "0300 303 0642"
}

variable "court_opening_hours" {
  default = "Monday to Friday, 8.30am to 5pm"
}

variable "court_email" {
  default = "contactdivorce@justice.gov.uk"
}

variable "common_tags" {
  type = "map"
}

variable "dev_support_notification_email" {
  default = "divorcesupportgroup@hmcts.net"
}

variable "decree_nisi_frontend_url" {
  default = ""
}

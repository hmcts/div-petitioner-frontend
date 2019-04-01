output "idam_api_url" {
  value = "${var.idam_api_url}"
}

output "case_orchestration_service_draft_url" {
  value = "${local.case_orchestration_service_url}${var.draft_store_api_base_path}"
}

output "feature_idam" {
  value = "${var.feature_idam}"
}

output "feature_release_520" {
  value = "${var.feature_release_520}"
}

output "feature_release_520_desertion" {
  value = "${var.feature_release_520_desertion}"
}

output "feature_release_530" {
  value = "${var.feature_release_530}"
}
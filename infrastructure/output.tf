output "idam_api_url" {
  value = "${var.idam_api_url}"
}

output "feature_toggle_api_url" {
  value = "${var.feature_toggle_api_url}"
}

output "case_progression_service_draft_url" {
  value = "${local.case_progression_service_url}${var.draft_store_api_base_path}"
}
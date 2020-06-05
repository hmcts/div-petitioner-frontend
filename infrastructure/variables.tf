// Infrastructural variables

variable "reform_team" {
  default = "div"
}

variable "component" {}

variable "product" {
  type = "string"
}

variable "location" {
  default = "UK South"
}

variable "env" {}

variable "common_tags" {
  type = "map"
}

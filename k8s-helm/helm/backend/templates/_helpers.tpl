{{- define "backend.fullname" -}}
{{ .Release.Name }}-backend
{{- end }}

{{- define "backend.serviceAccountName" -}}
{{- if .Values.serviceAccount.name }}
{{ .Values.serviceAccount.name }}
{{- else }}
{{ include "backend.fullname" . }}
{{- end }}
{{- end }}
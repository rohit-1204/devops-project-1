{{- define "frontend.fullname" -}}
{{ .Release.Name }}-frontend
{{- end }}

{{- define "frontend.serviceAccountName" -}}
{{- if .Values.serviceAccount.name }}
{{ .Values.serviceAccount.name }}
{{- else }}
{{ include "frontend.fullname" . }}
{{- end }}
{{- end }}
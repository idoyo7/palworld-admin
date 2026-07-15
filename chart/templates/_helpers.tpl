{{- define "palworld-admin.name" -}}
{{- .Values.name | default "palworld-admin" -}}
{{- end -}}

{{- define "palworld-admin.labels" -}}
app: {{ include "palworld-admin.name" . }}
app.kubernetes.io/name: {{ include "palworld-admin.name" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

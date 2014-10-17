package utils

import (
	"fmt"
	logrus "github.com/Sirupsen/logrus"
	"log"
	"regexp"
	"time"
)

var (
	t         = regexp.MustCompile("(\\d\\d:\\d\\d:\\d\\d)")
	f         = regexp.MustCompile("([^/]*:\\d*)")
	sqlRegexp = regexp.MustCompile(`(\$\d+)|\?`)
)

type logrusWriter struct{}

func (w *logrusWriter) Write(p []byte) (n int, err error) {
	l := len(p)
	s := string(p[:l-1])
	s = t.ReplaceAllString(s, "\033[38;05;242m$1\033[0m")

	logrus.Debug(s)
	return len(p), nil
}

func CreateMartiniLogger() *log.Logger {
	return log.New(&logrusWriter{}, "\033[01m[martini]\033[0m ", log.Ltime)
}

type gormLogger struct{}

func (w *gormLogger) Print(v ...interface{}) {
	if len(v) > 1 {
		level := v[0]
		messages := []interface{}{}

		if level == "sql" {
			// duration
			messages = append(messages, fmt.Sprintf("\033[36;1m[%.2fms]\033[0m ", float64(v[2].(time.Duration).Nanoseconds()/1e4)/100.0))
			// sql
			messages = append(messages, fmt.Sprintf(sqlRegexp.ReplaceAllString(v[3].(string), "'%v'"), v[4].([]interface{})...))
		} else {
			messages = append(messages, "\033[31;1m")
			messages = append(messages, v[2:]...)
			messages = append(messages, "\033[0m")
		}

		logrus.WithFields(logrus.Fields{
			"source": f.FindString(v[1].(string)),
			"time":   time.Now().Format("2006-01-02 15:04:05"),
		}).Info(messages...)
	}
}
func CreateGormLogger() *gormLogger {
	return &gormLogger{}
}

package script

import (
	"github.com/robertkrimen/otto"
	"path"
)

var SCRIPT_PATH = "data/scripts"

var VM = otto.New()

func Load(name, src string) *otto.Script {
	//VM.Compile(
}

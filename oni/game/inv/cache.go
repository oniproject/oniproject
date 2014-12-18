package inv

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"path"
)

var ITEM_PATH = "data/items"

var cache = make(map[string]*Item)

func WipeCache() {
	cache = make(map[string]*Item)
}

func ItemByName(name string) (item *Item, err error) {
	item, ok := cache[name]
	if ok {
		return
	}

	fname := path.Join(ITEM_PATH, name+".yml")

	file, err := ioutil.ReadFile(fname)
	if err != nil {
		return nil, err
	}

	item = &Item{}
	err = yaml.Unmarshal(file, item)
	if err != nil {
		return nil, err
	}

	cache[name] = item

	//item.Xfeatures = ParseFeatureList(item.Features)

	return item, err
}

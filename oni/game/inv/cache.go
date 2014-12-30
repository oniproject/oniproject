package inv

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"path"
	"sync"
)

var ITEM_PATH = "data/items"

type itemCache struct {
	items map[string]*Item
	sync.Mutex
}

var cache = itemCache{items: make(map[string]*Item)}

func WipeCache() {
	cache.Lock()
	defer cache.Unlock()

	cache.items = make(map[string]*Item)
}

func ItemByName(name string) (item *Item, err error) {
	cache.Lock()
	defer cache.Unlock()

	item, ok := cache.items[name]
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

	cache.items[name] = item

	//item.Xfeatures = ParseFeatureList(item.Features)

	return item, err
}

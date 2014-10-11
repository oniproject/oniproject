package game

import (
	"errors"
	"gopkg.in/yaml.v2"
	"io/ioutil"
)

const (
	ITEM_ATTR_DONTDROP          = 1 << iota // cant drop to ground
	ITEM_ATTR_DONTUSE                       // cant be used like a potion
	ITEM_ATTR_DONTEQUIP                     // isnt clothing or weapon
	ITEM_ATTR_DONTTRADE                     // cant be sold/transferred to another player
	ITEM_ATTR_DONTSELL                      // cant be sold at NPC
	ITEM_ATTR_DONTMOVETOSTORAGE             // cant be move to storage

	ITEM_ATTR_QUEST = ITEM_ATTR_DONTDROP | ITEM_ATTR_DONTTRADE | ITEM_ATTR_DONTSELL | ITEM_ATTR_DONTMOVETOSTORAGE
)

type Item struct {
	Name        string
	Icon        string
	Description string

	Type       string
	Class      string
	Attributes int // see consts
	Weight     int
	PriceBuy   int
	PriceSell  int

	EquipTypeId  int
	Slot1, Slot2 string
	Dual         bool

	Features string
	features FeatureList

	//EquipScript   string
	//UnEquipScript string

	// usage
	UseScript string
	//useScript EffectList `db:"-"`

	Range int // atk range for weapon
	DEF   int `yml:"def"`
	ATK   int `yml:"atk"`

	Level  int
	PLevel int
}

func LoadItemYaml(fname string) (*Item, error) {
	file, err := ioutil.ReadFile(fname)
	if err != nil {
		return nil, err
	}

	item := &Item{}
	err = yaml.Unmarshal(file, item)
	if err != nil {
		return nil, err
	}

	return item, err
}

/*
func (item *Item) Drop() error          { return nil }
func (item *Item) Use() error           { return nil }
func (item *Item) Equip() error         { return nil }
func (item *Item) Trade() error         { return nil }
func (item *Item) Sell() error          { return nil }
func (item *Item) MoveToStorage() error { return nil }
*/

func (item *Item) TryEquip(actor *Actor) error {
	// TODO check level and others
	if !actor.TestEquipType(item.EquipTypeId) {
		return errors.New("fail item type")
	}
	return nil
}

func (item *Item) ApplyFeatures(r FeatureReceiver) { item.features.Run(r) }

/*
#define ITEM_ATTR_DONTDROP 1
#define ITEM_ATTR_DONTTRADE 2
#define ITEM_ATTR_DONTREMOVE 4
#define ITEM_ATTR_DONTMOVETOSTORAGE 8
#define ITEM_ATTR_DONTMOVETOCART 16
#define ITEM_ATTR_DONTUSE 32
#define ITEM_ATTR_DONTEQUIP 64
#define ITEM_ATTR_DONTREMOVEMAGIC 128
#define ITEM_ATTR_DONTMOVETOGSTORAGE 256
#define ITEM_ATTR_DONTSELL 512

struct item_data
{
    int  nameid;
    char name[24], jname[24];
    char prefix[24], suffix[24];
    char cardillustname[64];
    int  value_buy;
    int  value_sell;

    int  type;
    int  attr;
    int  sex;
    int  equip;
    int  weight;
    int  atk;
    int  def;
    int  range;
    int  magic_bonus;
    int  slot;
    int  look;
    int  elv;
    int  wlv;
    int  view_id;
    int  refine;
    char *use_script;
    char *equip_script;
    char *unequip_script;
    struct
    {
        unsigned available:1;
        unsigned value_notdc:1;
        unsigned value_notoc:1;
        unsigned no_equip:3;
        unsigned no_drop:1;
        unsigned no_use:1;
    } flag;
};*/

/*type Weapon struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	Price int

	EquipTypeId int
	SlotTypeId  int
	Animation   int

	Features string
	features FeatureList `db:"-"`

	// comment
	Note string
}*/

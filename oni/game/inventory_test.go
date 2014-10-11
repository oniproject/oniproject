package game

import "testing"
import "path"

var test_hauberk, _ = LoadItemYaml(path.Join(item_path, "hauberk.yml"))
var test_bow, _ = LoadItemYaml(path.Join(item_path, "bow.yml"))
var test_knife1, _ = LoadItemYaml(path.Join(item_path, "knife.yml"))
var test_knife2, _ = LoadItemYaml(path.Join(item_path, "knife.yml"))

func TestInventory(t *testing.T) {
	inv := NewInventory()
	inv.AddItem(test_hauberk)

	// equip
	if err := inv.EquipItem(0); err != nil {
		t.Error(err, inv)
	}
	if err := inv.EquipItem(0); err != ItemNotfound {
		t.Error("fail ItemNotfound", inv)
	}
	if err := inv.EquipItem(2); err != ItemNotfound {
		t.Error("fail ItemNotfound", inv)
	}

	// unequip
	if err := inv.UnequipItem("body"); err != nil {
		t.Error(err, inv)
	}
	if err := inv.UnequipItem("LOL"); err != ItemNotfound {
		t.Error("fail ItemNotfound", inv)
	}

	// dualslot
	inv.AddItem(test_bow)
	if err := inv.EquipItem(1); err != nil {
		t.Error(err, inv)
	}
	printIventory(t, "dualslot", inv)
	if err := inv.UnequipItem("left"); err != nil {
		t.Error(err, inv)
	}

	// dualslot 2
	inv.AddItem(test_knife1)
	inv.AddItem(test_knife2)
	printIventory(t, "dualslot 2", inv)

	if err := inv.EquipItem(2); err != nil {
		t.Error(err, inv)
	}
	printIventory(t, "knife 1", inv)

	if err := inv.EquipItem(2); err != nil {
		t.Error(err, inv)
	}
	printIventory(t, "knife 2", inv)

	if err := inv.EquipItem(1); err != nil {
		t.Error(err, inv)
	}
	printIventory(t, "END", inv)
	if err := inv.EquipItem(2); err != nil {
		t.Error(err, inv)
	}
	printIventory(t, "end", inv)
}

func printIventory(t *testing.T, s string, inv *Inventory) {
	t.Logf("\t%s %v %v", s, inv.Inventory, inv.Equip)
	for k, v := range inv.Inventory {
		t.Log(k, v.Name)
	}
}

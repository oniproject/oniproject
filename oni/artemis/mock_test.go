// Automatically generated by MockGen. DO NOT EDIT!
// Source: oniproject/oni/artemis (interfaces: Entity,EntityObserver,Manager,System)

package artemis_test

import (
	bitset "github.com/willf/bitset"
	gomock "code.google.com/p/gomock/gomock"
	artemis "oniproject/oni/artemis"
)

// Mock of Entity interface
type MockEntity struct {
	ctrl     *gomock.Controller
	recorder *_MockEntityRecorder
}

// Recorder for MockEntity (not exported)
type _MockEntityRecorder struct {
	mock *MockEntity
}

func NewMockEntity(ctrl *gomock.Controller) *MockEntity {
	mock := &MockEntity{ctrl: ctrl}
	mock.recorder = &_MockEntityRecorder{mock}
	return mock
}

func (_m *MockEntity) EXPECT() *_MockEntityRecorder {
	return _m.recorder
}

func (_m *MockEntity) AddComponent(_param0 artemis.Component) artemis.Entity {
	ret := _m.ctrl.Call(_m, "AddComponent", _param0)
	ret0, _ := ret[0].(artemis.Entity)
	return ret0
}

func (_mr *_MockEntityRecorder) AddComponent(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "AddComponent", arg0)
}

func (_m *MockEntity) AddToWorld() {
	_m.ctrl.Call(_m, "AddToWorld")
}

func (_mr *_MockEntityRecorder) AddToWorld() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "AddToWorld")
}

func (_m *MockEntity) ChangedInWorld() {
	_m.ctrl.Call(_m, "ChangedInWorld")
}

func (_mr *_MockEntityRecorder) ChangedInWorld() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "ChangedInWorld")
}

func (_m *MockEntity) ComponentBits() *bitset.BitSet {
	ret := _m.ctrl.Call(_m, "ComponentBits")
	ret0, _ := ret[0].(*bitset.BitSet)
	return ret0
}

func (_mr *_MockEntityRecorder) ComponentBits() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "ComponentBits")
}

func (_m *MockEntity) ComponentByType(_param0 *artemis.ComponentType) artemis.Component {
	ret := _m.ctrl.Call(_m, "ComponentByType", _param0)
	ret0, _ := ret[0].(artemis.Component)
	return ret0
}

func (_mr *_MockEntityRecorder) ComponentByType(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "ComponentByType", arg0)
}

func (_m *MockEntity) Components() []artemis.Component {
	ret := _m.ctrl.Call(_m, "Components")
	ret0, _ := ret[0].([]artemis.Component)
	return ret0
}

func (_mr *_MockEntityRecorder) Components() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Components")
}

func (_m *MockEntity) DeleteFromWorld() {
	_m.ctrl.Call(_m, "DeleteFromWorld")
}

func (_mr *_MockEntityRecorder) DeleteFromWorld() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "DeleteFromWorld")
}

func (_m *MockEntity) Disable() {
	_m.ctrl.Call(_m, "Disable")
}

func (_mr *_MockEntityRecorder) Disable() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Disable")
}

func (_m *MockEntity) Enable() {
	_m.ctrl.Call(_m, "Enable")
}

func (_mr *_MockEntityRecorder) Enable() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Enable")
}

func (_m *MockEntity) Id() int {
	ret := _m.ctrl.Call(_m, "Id")
	ret0, _ := ret[0].(int)
	return ret0
}

func (_mr *_MockEntityRecorder) Id() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Id")
}

func (_m *MockEntity) IsActive() bool {
	ret := _m.ctrl.Call(_m, "IsActive")
	ret0, _ := ret[0].(bool)
	return ret0
}

func (_mr *_MockEntityRecorder) IsActive() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "IsActive")
}

func (_m *MockEntity) IsEnabled() bool {
	ret := _m.ctrl.Call(_m, "IsEnabled")
	ret0, _ := ret[0].(bool)
	return ret0
}

func (_mr *_MockEntityRecorder) IsEnabled() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "IsEnabled")
}

func (_m *MockEntity) MarshalJSON() ([]byte, error) {
	ret := _m.ctrl.Call(_m, "MarshalJSON")
	ret0, _ := ret[0].([]byte)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

func (_mr *_MockEntityRecorder) MarshalJSON() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "MarshalJSON")
}

func (_m *MockEntity) RemoveComponent(_param0 artemis.Component) artemis.Entity {
	ret := _m.ctrl.Call(_m, "RemoveComponent", _param0)
	ret0, _ := ret[0].(artemis.Entity)
	return ret0
}

func (_mr *_MockEntityRecorder) RemoveComponent(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "RemoveComponent", arg0)
}

func (_m *MockEntity) String() string {
	ret := _m.ctrl.Call(_m, "String")
	ret0, _ := ret[0].(string)
	return ret0
}

func (_mr *_MockEntityRecorder) String() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "String")
}

func (_m *MockEntity) SystemBits() *bitset.BitSet {
	ret := _m.ctrl.Call(_m, "SystemBits")
	ret0, _ := ret[0].(*bitset.BitSet)
	return ret0
}

func (_mr *_MockEntityRecorder) SystemBits() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "SystemBits")
}

func (_m *MockEntity) UnmarshalJSON(_param0 []byte) error {
	ret := _m.ctrl.Call(_m, "UnmarshalJSON", _param0)
	ret0, _ := ret[0].(error)
	return ret0
}

func (_mr *_MockEntityRecorder) UnmarshalJSON(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "UnmarshalJSON", arg0)
}

func (_m *MockEntity) World() *artemis.World {
	ret := _m.ctrl.Call(_m, "World")
	ret0, _ := ret[0].(*artemis.World)
	return ret0
}

func (_mr *_MockEntityRecorder) World() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "World")
}

// Mock of EntityObserver interface
type MockEntityObserver struct {
	ctrl     *gomock.Controller
	recorder *_MockEntityObserverRecorder
}

// Recorder for MockEntityObserver (not exported)
type _MockEntityObserverRecorder struct {
	mock *MockEntityObserver
}

func NewMockEntityObserver(ctrl *gomock.Controller) *MockEntityObserver {
	mock := &MockEntityObserver{ctrl: ctrl}
	mock.recorder = &_MockEntityObserverRecorder{mock}
	return mock
}

func (_m *MockEntityObserver) EXPECT() *_MockEntityObserverRecorder {
	return _m.recorder
}

func (_m *MockEntityObserver) Added(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Added", _param0)
}

func (_mr *_MockEntityObserverRecorder) Added(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Added", arg0)
}

func (_m *MockEntityObserver) Changed(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Changed", _param0)
}

func (_mr *_MockEntityObserverRecorder) Changed(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Changed", arg0)
}

func (_m *MockEntityObserver) Deleted(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Deleted", _param0)
}

func (_mr *_MockEntityObserverRecorder) Deleted(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Deleted", arg0)
}

func (_m *MockEntityObserver) Disabled(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Disabled", _param0)
}

func (_mr *_MockEntityObserverRecorder) Disabled(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Disabled", arg0)
}

func (_m *MockEntityObserver) Enabled(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Enabled", _param0)
}

func (_mr *_MockEntityObserverRecorder) Enabled(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Enabled", arg0)
}

// Mock of Manager interface
type MockManager struct {
	ctrl     *gomock.Controller
	recorder *_MockManagerRecorder
}

// Recorder for MockManager (not exported)
type _MockManagerRecorder struct {
	mock *MockManager
}

func NewMockManager(ctrl *gomock.Controller) *MockManager {
	mock := &MockManager{ctrl: ctrl}
	mock.recorder = &_MockManagerRecorder{mock}
	return mock
}

func (_m *MockManager) EXPECT() *_MockManagerRecorder {
	return _m.recorder
}

func (_m *MockManager) Added(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Added", _param0)
}

func (_mr *_MockManagerRecorder) Added(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Added", arg0)
}

func (_m *MockManager) Changed(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Changed", _param0)
}

func (_mr *_MockManagerRecorder) Changed(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Changed", arg0)
}

func (_m *MockManager) Deleted(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Deleted", _param0)
}

func (_mr *_MockManagerRecorder) Deleted(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Deleted", arg0)
}

func (_m *MockManager) Disabled(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Disabled", _param0)
}

func (_mr *_MockManagerRecorder) Disabled(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Disabled", arg0)
}

func (_m *MockManager) Enabled(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Enabled", _param0)
}

func (_mr *_MockManagerRecorder) Enabled(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Enabled", arg0)
}

func (_m *MockManager) Initialize() {
	_m.ctrl.Call(_m, "Initialize")
}

func (_mr *_MockManagerRecorder) Initialize() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Initialize")
}

func (_m *MockManager) SetWorld(_param0 *artemis.World) {
	_m.ctrl.Call(_m, "SetWorld", _param0)
}

func (_mr *_MockManagerRecorder) SetWorld(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "SetWorld", arg0)
}

// Mock of System interface
type MockSystem struct {
	ctrl     *gomock.Controller
	recorder *_MockSystemRecorder
}

// Recorder for MockSystem (not exported)
type _MockSystemRecorder struct {
	mock *MockSystem
}

func NewMockSystem(ctrl *gomock.Controller) *MockSystem {
	mock := &MockSystem{ctrl: ctrl}
	mock.recorder = &_MockSystemRecorder{mock}
	return mock
}

func (_m *MockSystem) EXPECT() *_MockSystemRecorder {
	return _m.recorder
}

func (_m *MockSystem) Added(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Added", _param0)
}

func (_mr *_MockSystemRecorder) Added(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Added", arg0)
}

func (_m *MockSystem) Changed(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Changed", _param0)
}

func (_mr *_MockSystemRecorder) Changed(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Changed", arg0)
}

func (_m *MockSystem) Deleted(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Deleted", _param0)
}

func (_mr *_MockSystemRecorder) Deleted(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Deleted", arg0)
}

func (_m *MockSystem) Disabled(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Disabled", _param0)
}

func (_mr *_MockSystemRecorder) Disabled(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Disabled", arg0)
}

func (_m *MockSystem) Enabled(_param0 artemis.Entity) {
	_m.ctrl.Call(_m, "Enabled", _param0)
}

func (_mr *_MockSystemRecorder) Enabled(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Enabled", arg0)
}

func (_m *MockSystem) Initialize() {
	_m.ctrl.Call(_m, "Initialize")
}

func (_mr *_MockSystemRecorder) Initialize() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Initialize")
}

func (_m *MockSystem) IsPassive() bool {
	ret := _m.ctrl.Call(_m, "IsPassive")
	ret0, _ := ret[0].(bool)
	return ret0
}

func (_mr *_MockSystemRecorder) IsPassive() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "IsPassive")
}

func (_m *MockSystem) Process() {
	_m.ctrl.Call(_m, "Process")
}

func (_mr *_MockSystemRecorder) Process() *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "Process")
}

func (_m *MockSystem) SetPassive(_param0 bool) {
	_m.ctrl.Call(_m, "SetPassive", _param0)
}

func (_mr *_MockSystemRecorder) SetPassive(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "SetPassive", arg0)
}

func (_m *MockSystem) SetWorld(_param0 *artemis.World) {
	_m.ctrl.Call(_m, "SetWorld", _param0)
}

func (_mr *_MockSystemRecorder) SetWorld(arg0 interface{}) *gomock.Call {
	return _mr.mock.ctrl.RecordCall(_mr.mock, "SetWorld", arg0)
}

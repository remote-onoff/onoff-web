/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
var ComputerInfo = (function () {
    function ComputerInfo() {
    }
    return ComputerInfo;
})();
var ServiceConnection = (function () {
    function ServiceConnection(address, password, $http) {
        this.address = address;
        this.password = password;
        this.$http = $http;
    }
    ServiceConnection.prototype.list = function (lh, eh) {
        var _this = this;
        this.acquireToken("list", function (token, salt) {
            _this.$http.get(_this.address + "/v1/list/" + token + "/" + salt).success(lh).error(function (err) {
                eh("Wrong password!");
            });
        }, eh);
    };
    ServiceConnection.prototype.acquireToken = function (action, th, eh) {
        var _this = this;
        this.$http.get(this.address + '/v1/token').success(function (data) {
            var source = data.prefix + ":" + action + ":" + _this.password;
            var token = _this.doHash(source);
            th(token, data.salt);
        }).error(function (err) {
            eh("Failed to acquire token!");
        });
    };
    ServiceConnection.prototype.doHash = function (input) {
        return input;
    };
    return ServiceConnection;
})();
var ConnectionController = (function () {
    function ConnectionController($scope, $http) {
        var _this = this;
        this.$scope = $scope;
        this.$http = $http;
        this.con = null;
        $scope["computers"] = [];
        $scope["server"] = "http://localhost:3489";
        $scope["status"] = "";
        $scope["connect"] = function (s, pw) { return _this.connect(s, pw); };
    }
    ConnectionController.prototype.connect = function (server, password) {
        var _this = this;
        this.setStatus("Connecting...");
        this.$http.get(server + "/version").success(function (data) {
            _this.setStatus("Connected with version " + data.version);
            _this.con = new ServiceConnection(server, password, _this.$http);
            _this.con.list(function (computers) {
                _this.setStatus("Connected with version " + data.version + " and password correct!");
                _this.$scope["computers"] = computers;
            }, function (err) {
                _this.setStatus(err);
            });
        }).error(function (err) {
            _this.setStatus("No Server found!");
        });
    };
    ConnectionController.prototype.setStatus = function (status) {
        this.$scope["status"] = status;
    };
    return ConnectionController;
})();
var app = angular.module("onoff-app", []);
app.controller("ConnectionController", ["$scope", "$http", ConnectionController]);
//# sourceMappingURL=app.js.map
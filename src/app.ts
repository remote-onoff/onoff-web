/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />


class ComputerInfo {
    id:number;
    name:string;
}


declare type ErrorHandler = (err: string) => void;
declare type TokenHandler = (token: string, salt:string) => void;
declare type ListHandler = (computers: ComputerInfo[]) => void;

class ServiceConnection {
	
	constructor(
		private address:string,
		private password:string,
		private $http:ng.IHttpService
	) {
	}
	
	public list(lh:ListHandler, eh:ErrorHandler) {
		this.acquireToken("list", (token:string, salt:string) => {
			
			this.$http.get(this.address + "/v1/list/" + token + "/" + salt).success(lh).error(
				(err:any) => {
					eh("Wrong password!");
			});
			
			
		}, eh);
	}
	
	private acquireToken(action:string, th:TokenHandler, eh:ErrorHandler):void {
		this.$http.get(this.address + '/v1/token').success(
			(data:any) => {
				
				let source = data.prefix + ":" + action + ":" + this.password;
				let token = this.doHash(source);
				th(token, data.salt);				
		}).error(
			(err:any) => {
				eh("Failed to acquire token!");
		});
	}
	
	private doHash(input:string) {
		return input;
	}
}

class ConnectionController {
	
	private con:ServiceConnection = null;
	
	constructor(
		private $scope: ng.IScope,
		private $http: ng.IHttpService
	) {
		$scope["computers"] = [];
		$scope["server"] = "http://localhost:3489";
		$scope["status"] = "";
		$scope["connect"] = (s, pw) => this.connect(s, pw);
	}
	
	public connect(server:string, password:string):void {
		this.setStatus("Connecting...");
		
		this.$http.get(server + "/version").success((data:any) => {
			this.setStatus("Connected with version " + data.version);
			
			this.con = new ServiceConnection(server, password, this.$http);
			this.con.list((computers) => {
				this.setStatus("Connected with version " + data.version + " and password correct!")
				this.$scope["computers"] = computers;
			}, (err) => {
				this.setStatus(err);
			})
		}).error((err) => {
			this.setStatus("No Server found!");
		});
	}
	
	public setStatus(status:string) {
		this.$scope["status"] = status;
	}
	
}

let app = angular.module("onoff-app", []);
app.controller("ConnectionController", ["$scope", "$http", ConnectionController])
export namespace network {
	
	export class ConnectionInfo {
	    local_addr: string;
	    remote_addr: string;
	    status: string;
	    pid: number;
	    process: string;
	
	    static createFrom(source: any = {}) {
	        return new ConnectionInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.local_addr = source["local_addr"];
	        this.remote_addr = source["remote_addr"];
	        this.status = source["status"];
	        this.pid = source["pid"];
	        this.process = source["process"];
	    }
	}

}


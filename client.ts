import { EventEmitter } from "node:events";
import * as path from "node:path";
import protobuf from "npm:protobufjs";
import Long from "npm:long";
import { fromFileUrl } from "jsr:@std/path";
import { AppInfo, AppMap, AppTeamInfo } from './types.d.ts'


export interface RustPlusOptions {
  ip: string;
  port: number;
  playerId: string;
  playerToken: number;
}

export class RustPlusClient extends EventEmitter {
  private ws?: WebSocket;
  private AppRequest?: protobuf.Type;
  private AppMessage?: protobuf.Type;
  private seq = 0;
  private callbacks: Map<number, (data: any) => void> = new Map();
  private connected = false;

  constructor(private options: RustPlusOptions) {
    super();
  }

  async connect() {
    try {
      // Get directory of current module file
      const moduleDir = path.dirname(fromFileUrl(import.meta.url));
      // Resolve proto file path relative to this module
      const protoPath = path.resolve(moduleDir, "./rustplus.proto");
      console.log(`Loading protobuf definitions from: ${protoPath}`);

      const root = await protobuf.load(protoPath);

      protobuf.util.Long = Long;
      protobuf.configure();
      this.AppRequest = root.lookupType("rustplus.AppRequest");
      this.AppMessage = root.lookupType("rustplus.AppMessage");

      const url = `ws://${this.options.ip}:${this.options.port}`

      console.log(`Connecting to: ${url}`);
      this.ws = new WebSocket(url);
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        this.connected = true;
        console.log("WebSocket connection established");
        this.emit("connected");
      };

      this.ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        this.emit("error", event);
      };

      this.ws.onclose = (event) => {
        this.connected = false;
        console.log(`WebSocket closed with code ${event.code}: ${event.reason}`);
        this.emit("disconnected");
      };

      this.ws.onmessage = (event) => {
        try {
          if (typeof event.data === "string") {
            // console.log("Received string message:", event.data);
            return;
          }

          let buffer = new Uint8Array(event.data);

          // Check if the length is under the minimum of 10 bytes
          // https://github.com/liamcottle/rustplus.js/pull/79
          if (buffer.length < 10) {
            const padded = new Uint8Array(10);
            padded.set(buffer); // Copies contents of `buffer` into `padded`
            buffer = padded;
          }




          const msg = this.AppMessage!.decode(buffer);

          // emit broadcasts such as team messages etc
          if (msg.broadcast) {
            this.emit("message", msg.broadcast);
          }

          if (msg.response?.seq && this.callbacks.has(msg.response.seq)) {
            const cb = this.callbacks.get(msg.response.seq)!;
            cb(msg.response);
            this.callbacks.delete(msg.response.seq);
          }
        } catch (err) {
          console.error("Error processing message:", err);
          this.emit("error", err);
        }
      };
    } catch (err) {
      console.error("Failed to connect:", err);
      this.emit("error", err);
      throw err;
    }
  }

  disconnect() {
    if (this.ws && this.connected) {
      console.log("Disconnecting from server");
      this.ws.close();
      this.ws = undefined;
    }
  }

  sendRequest(data: object): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || !this.connected) {
        return reject(new Error("Not connected to server"));
      }

      if (!this.AppRequest) {
        return reject(new Error("Protobuf definitions not loaded"));
      }

      try {
        const seq = ++this.seq;
        const requestObj = {
          seq,
          playerId: Long.fromString(this.options.playerId),

          playerToken: this.options.playerToken,
          ...data,
        };

        // console.log(`Sending request #${seq}:`, requestObj);

        const err = this.AppRequest.verify(requestObj);
        if (err) {
          console.error("Invalid request:", err);
          return reject(new Error(`Invalid request: ${err}`));
        }

        const message = this.AppRequest.create(requestObj);
        const buffer = this.AppRequest.encode(message).finish();

        this.callbacks.set(seq, resolve);
        this.ws.send(buffer);
      } catch (err) {
        console.error("Error sending request:", err);
        reject(err);
      }
    });
  }

  async getInfo(): Promise<AppInfo> {
    try {
      const response = await this.sendRequest({ getInfo: {} });
      return response.info as AppInfo;
    } catch (err) {
      console.error("Error getting server info:", err);
      throw err;
    }
  }

  async getMap(): Promise<AppMap> {
    try {
      const response = await this.sendRequest({ getMap: {} });
      return response.map as AppMap;
    } catch (err) {
      console.error("Error getting server info:", err);
      throw err;
    }
  }

  async sendTeamMessage(message: string): Promise<boolean> {
    try {
      const res = await this.sendRequest({ sendTeamMessage: { message } });
      
      if (res.error) throw res.error;

      return true;
    } catch (err) {
      console.error("Request error:", err);
      return false;
    }
  }


  async getTeamInfo(): Promise<AppTeamInfo> {
    try {
      const response = await this.sendRequest({ getTeamInfo: {} });
      return response.teamInfo as AppTeamInfo;
    } catch (err) {
      console.error("Error getting team info:", err);
      throw err;
    }
  }
}
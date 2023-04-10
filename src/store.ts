import { AsyncLocalStorage } from "node:async_hooks";
import {
  Container, Injectable,
  IdentifierT, IdeintifiedT, ConstructableT
} from ".";

@Injectable()
export class Store {
  public containers: Map<string, Container>;
  public storage: AsyncLocalStorage<Map<IdentifierT, Exclude<IdeintifiedT, ConstructableT> | InstanceType<ConstructableT>>>;

  constructor() {
    this.containers = new Map<string, Container>();
    this.storage = new AsyncLocalStorage();
  }
}
import { AsyncLocalStorage } from "node:async_hooks";
import {
  Container, Injectable,
  IdentifierT, IdeintifiedT, ConstructableT,
} from ".";

@Injectable()
export class Store {
  static modules: ConstructableT[] = [];
  static containers: Map<string, Container> = new Map<string, Container>();
  static storage: AsyncLocalStorage<
  Map<IdentifierT, Exclude<IdeintifiedT, ConstructableT> | InstanceType<ConstructableT>>
  > = new AsyncLocalStorage();
}

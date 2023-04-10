import { AsyncLocalStorage } from "node:async_hooks";
import { IdentifierT, IdeintifiedT, ConstructableT } from "../shared/type";
import { Container } from "../container";

export class Store {
  static modules: ConstructableT[] = [];
  static containers: Map<string, Container> = new Map<string, Container>();
  static storage: AsyncLocalStorage<
  Map<IdentifierT, Exclude<IdeintifiedT, ConstructableT> | InstanceType<ConstructableT>>
  > = new AsyncLocalStorage();
}

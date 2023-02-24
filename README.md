# injection

[![codecov](https://codecov.io/gh/X-Profiler/injection/branch/master/graph/badge.svg?token=iED2cm94Dg)](https://codecov.io/gh/X-Profiler/injection)
[![Node.js CI](https://github.com/X-Profiler/injection/actions/workflows/nodejs.yml/badge.svg?branch=master)](https://github.com/X-Profiler/injection/actions/workflows/nodejs.yml)
[![License](https://img.shields.io/github/license/x-profiler/injection)](LICENSE)

An IoC implemention for xprofiler.

## Usage

### Decorator

```ts
import { Injectable, Inject } from "@xprofiler/injection";
import { Config } from "./config";

@Injectable()
export class Foo {
  @Inject()
  private config: Config;

  getKmsConfig(@Inject('KMS_KEY') key: string) {
    return this.config[key];
  }
}
```

### Container

```ts
import { Container } from "@xprofiler/injection";
import { Foo, Bar } from "./items";

const container = new Container();

container.set(Foo);
container.set(Bar);

const foo = container.get(Foo);
const bar = container.get(Bar);
```
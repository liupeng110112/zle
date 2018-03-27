import { chain, Chainable } from "../../lib/Chain";
import { Component } from "../../lib/Component";
import { UIDefinition } from "../../lib/UIDefinition";

export interface IAnimalHouse {
  has(): Promise<string>;
}

export class Gate extends Component {
  static $definition = UIDefinition.root("div.gate");

  gotoTigerHouse(): Chainable<TigerHouse> {
    return chain(() => {
      return this.$context.waitFor(TigerHouse);
    });
  }
}

export class TigerHouse extends Component implements IAnimalHouse {
  static $definition = UIDefinition.root("div.tiger-house", "tiger house");

  has() {
    return this.$textOf("tiger house");
  }

  gotoMonkeyHouse() {
    return chain(() => {
      return this.$context.waitFor(MonekyHouse);
    });
  }
}

export class MonekyHouse extends Component implements IAnimalHouse {
  static $definition = UIDefinition.root("div.monkey-house", "monkey house");

  has() {
    return this.$textOf("monkey house");
  }

  gotoPandaHouse() {
    return chain(() => {
      return this.$context.waitFor(PandaHouse);
    });
  }
}

export class PandaHouse extends Component implements IAnimalHouse {
  static $definition = UIDefinition.root("div.panda-house", "panda house");

  has() {
    return this.$textOf("panda house");
  }

  gotoGiraffeHouse() {
    return chain(() => {
      return this.$context.waitFor(GiraffeHouse);
    });
  }
}

export class GiraffeHouse extends Component implements IAnimalHouse {
  static $definition = UIDefinition.root("div.giraffe-house", "giraffe house");

  has() {
    return this.$textOf("giraffe house");
  }
  gotoGate() {
    return chain(() => {
      return this.$context.waitFor(Gate);
    });
  }
}

export class Zoo extends Component {
  static $definition = UIDefinition.root("div.zoo")
    .withDescendant(Gate)
    .withDescendant(TigerHouse)
    .withDescendant(MonekyHouse)
    .withDescendant(PandaHouse)
    .withDescendant(GiraffeHouse);

  gotoGate() {
    return chain(() => {
      return this.$context.waitFor(Gate);
    });
  }
}

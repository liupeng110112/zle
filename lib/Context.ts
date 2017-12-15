import { IContainer, Container } from './Container';

export interface IContext {
  container: IContainer;
}

export class Context {
  container: IContainer = new Container(this);
}

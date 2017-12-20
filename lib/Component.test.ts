import { Component } from './Component';
import { Context } from './Context';

describe('Component', () => {
  const context = new Context();

  describe('with no descendants', () => {
    class Main extends Component {
      definition = this.$root('.main', 'main');
    }
    const main = new Main(context);

    test('can find itself with right name', () => {
      expect(main.$findNodeByName('notexist')).toBeUndefined();
      const node = main.$findNodeByName('main')!;
      expect(node.$selector).toEqual('.main');
      expect(node.$name).toEqual('main');
      expect(node.$hasDescendants).toBeFalsy();
    });

    test('walk nodes correctly', () => {
      const nodes = Array.from(main.$walkNodes());
      expect(nodes.length).toEqual(1);
      const node = nodes[0];
      expect(node.$selector).toEqual('.main');
      expect(node.$name).toEqual('main');
      expect(node.$hasDescendants).toBeFalsy();
    });
  });

  describe('with only leaves', () => {
    class Main extends Component {
      definition = this.$root('.main', 'main')
                           .withDescendant('.nav-bar', 'nav bar')
                           .withDescendant('.content-area');
    }
    const main = new Main(context);

    test('has descendants', () => {
      const node = main.$findNodeByName('main')!;
      expect(node.$selector).toEqual('.main');
      expect(node.$name).toEqual('main');
      expect(node.$hasDescendants).toBeTruthy();
    });

    test('can find node by name', () => {
      const node = main.$findNodeByName('nav bar')!;
      expect(node.$selector).toEqual('.nav-bar');
      expect(node.$name).toEqual('nav bar');
    });

    test('walk nodes correctly', () => {
      const nodes = Array.from(main.$walkNodes());
      expect(nodes[0].$selector).toEqual('.main');
      expect(nodes[0].$name).toEqual('main');
      expect(nodes[0].$hasDescendants).toBeTruthy();
      expect(nodes[1].$selector).toEqual('.nav-bar');
      expect(nodes[1].$name).toEqual('nav bar');
      expect(nodes[1].$hasDescendants).toBeFalsy();
      expect(nodes[2].$selector).toEqual('.content-area');
      expect(nodes[2].$name).toBeUndefined();
      expect(nodes[2].$hasDescendants).toBeFalsy();
    });
  });

  describe('with several descendants', () => {
    class NavBar extends Component {
      definition = this.$root('.nav-bar', 'generic nav bar')
    }

    class Main extends Component {
      definition = this.$root('.main')
                          .withDescendant(NavBar, 'specific nav bar')
                          .withDescendant('.content-area', 'content area');
    }

    const main = new Main(context);
    test('can find node by name', () => {
      const node = main.$findNodeByName('specific nav bar')!;
      expect(node.$selector).toEqual('.nav-bar');
      expect(node.$name).toEqual('specific nav bar');
      expect(node.$hasDescendants).toBeFalsy();
    });
    test('cannot find nonexistent node', () => {
      expect(main.$findNodeByName('generic nav bar')).toBeUndefined();
    });
  });

  describe('with many descendants', () => {
    class NavBar extends Component {
      definition = this.$root('.nav-bar');
    }

    class Header extends Component {
      definition = this.$root('header', 'general header')
                          .withDescendant('h2', 'post title');
    }

    class Footer extends Component {
      definition = this.$root('footer', 'hot footer')
                          .withDescendant('span.author')
                          .withDescendant('span.publish-date', 'publish date');
    }

    class Main extends Component {
      definition = this.$root('.main')
                          .withDescendant(NavBar)
                          .withDescendant(Header, 'magic header')
                          .withDescendant(Footer);
    }

    const main = new Main(context);

    test('can find node by name', () => {
      let node = main.$findNodeByName('magic header')!;
      expect(node.$selector).toEqual('header');
      expect(node.$name).toEqual('magic header');
      expect(node.$hasDescendants).toBeTruthy();
      node = main.$findNodeByName('hot footer')!;
      expect(node.$selector).toEqual('footer');
      expect(node.$name).toEqual('hot footer');
      expect(node.$hasDescendants).toBeTruthy();
    });

    test('cannot find nonexistent node', () => {
      expect(main.$findNodeByName('general header')).toBeUndefined();
    });

    test('walk nodes correctly', () => {
      const expections = [
        {
          $selector: '.main',
          $name: undefined,
          $hasDescendants: true
        },
        {
          $selector: '.nav-bar',
          $name: undefined,
          $hasDescendants: false
        },
        {
          $selector: 'header',
          $name: 'magic header',
          $hasDescendants: true
        },
        {
          $selector: 'h2',
          $name: 'post title',
          $hasDescendants: false
        },
        {
          $selector: 'footer',
          $name: 'hot footer',
          $hasDescendants: true
        },
        {
          $selector: 'span.author',
          $name: undefined,
          $hasDescendants: false
        },
        {
          $selector: 'span.publish-date',
          $name: 'publish date',
          $hasDescendants: false
        }
      ];
      const results = Array.from(main.$walkNodes());
      expect(results.length).toEqual(expections.length);
      for (let i = 0; i < results.length; i++) {
        expect(results[i].$selector).toEqual(expections[i].$selector);
        expect(results[i].$name).toEqual(expections[i].$name);
        expect(!!results[i].$hasDescendants).toEqual(expections[i].$hasDescendants);
      }
    });
  });
});

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
      expect(main.$findNodeByName('main')).toEqual({
        $selector: '.main',
        $name: 'main',
        $hasDescendants: false
      })
    });

    test('walk nodes correctly', () => {
      expect(Array.from(main.$walkNodes())).toEqual([{
        $selector: '.main',
        $name: 'main',
        $hasDescendants: false
      }]);
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
      expect(main.$findNodeByName('main')).toEqual({
        $selector: '.main',
        $name: 'main',
        $hasDescendants: true
      })
    });

    test('can find node by name', () => {
      const node = main.$findNodeByName('nav bar')!;
      expect(node.$selector).toEqual('.nav-bar');
      expect(node.$name).toEqual('nav bar');
    });

    test('walk nodes correctly', () => {
      const result = Array.from(main.$walkNodes());
      expect(result[0]).toEqual({
        $selector: '.main',
        $name: 'main',
        $hasDescendants: true
      });
      expect(result[1]).toEqual({
        $selector: '.nav-bar',
        $name: 'nav bar',
        $hasDescendants: false
      });
      expect(result[2]).toEqual({
        $selector: '.content-area',
        $name: undefined,
        $hasDescendants: false
      });
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
      expect(main.$findNodeByName('specific nav bar')).toEqual({
        $selector: '.nav-bar',
        $name: 'specific nav bar',
        $hasDescendants: false
      })
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
      expect(main.$findNodeByName('magic header')).toEqual({
        $selector: 'header',
        $name: 'magic header',
        $hasDescendants: true
      });
      expect(main.$findNodeByName('hot footer')).toEqual({
        $selector: 'footer',
        $name: 'hot footer',
        $hasDescendants: true
      });
    });

    test('cannot find nonexistent node', () => {
      expect(main.$findNodeByName('general header')).toBeUndefined();
    });

    test('walk nodes correctly', () => {
      expect(Array.from(main.$walkNodes())).toEqual([
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
      ]);
    });
  });
});

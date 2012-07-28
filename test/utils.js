
/**
 * Module dependencies.
 */

var utils = require('../lib/utils');

describe('utils.parse(str)', function(){
  it('should parse the command pipeline', function(){
    var cmds = utils.parse('foo    |   bar    |   baz');
    cmds[0].should.eql({ name: 'foo', argv: [], env: {} });
    cmds[1].should.eql({ name: 'bar', argv: [], env: {} });
    cmds[2].should.eql({ name: 'baz', argv: [], env: {} });
  })

  it('should parse argv per command', function(){
    var cmds = utils.parse('foo 1 | bar 1 2 | baz 1 2 3');
    cmds[0].should.eql({ name: 'foo', argv: ['1'], env: {} });
    cmds[1].should.eql({ name: 'bar', argv: ['1', '2'], env: {} });
    cmds[2].should.eql({ name: 'baz', argv: ['1', '2', '3'], env: {} });
  })

  it('should populate .env with env variables', function(){
    var cmds = utils.parse('FOO=bar BAR=baz node app');
    cmds[0].should.eql({ name: 'node', argv: ['app'], env: { FOO: 'bar', BAR: 'baz' } });
  })

  it('should support env only', function(){
    var cmds = utils.parse('foo=bar');
    cmds.should.have.length(0);
    var cmds = utils.parse('foo=bar   bar=baz');
    cmds.should.have.length(0);
  })

  it('should perform brace expansion', function(){
    var cmds = utils.parse('foo{bar,baz,raz}');
    cmds[0].should.eql({ env: {}, argv: ['foobaz', 'fooraz'], name: 'foobar' });
  })
})

describe('utils.unquote(str)', function(){
  it('should strip single quotes', function(){
    utils.unquote("'test'").should.equal('test');
  })

  it('should strip double quotes', function(){
    utils.unquote('"test"').should.equal('test');
  })
})

describe('utils.stripEscapeCodes(str)', function(){
  it('should strip ansi escape sequences', function(){
    utils.stripEscapeCodes('\033[31mtest\033[m')
      .should.equal('test');
  })
})
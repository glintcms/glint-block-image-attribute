/**
 * Module dependencies.
 */
var debug = require('debug')('glint-block-image-attribute');
var fs = require('fs');
var merge = require('utils-merge');

var dot = require('dot');

var domify = require('domify');

var addClass = require('amp-add-class');
var removeClass = require('amp-remove-class');

var loadScript = require('load-script');
var loadStyle = require('load-style');

var urlPathname = require('url-pathname');

var i18n = require('glint-i18n')();

var c = require('./config');

var imageTmpl = fs.readFileSync(__dirname + '/index.dot', 'utf-8');
var imageTemplate = dot.template(i18n.translate(imageTmpl));

var editorTmpl = fs.readFileSync(__dirname + '/editor.dot', 'utf-8');
var editorTemplate = dot.template(i18n.translate(editorTmpl));


/**
 * Expose ImageAttributeBlock element.
 */
exports = module.exports = ImageAttributeBlock;

/**
 * Initialize a new `ImageAttributeBlock` element.
 * @param {Object} options object
 */
function ImageAttributeBlock(options) {
  if (!(this instanceof ImageAttributeBlock)) return new ImageAttributeBlock(options);

  merge(this, c);
  merge(this, options);
}

/**
 * API functions.
 */
ImageAttributeBlock.prototype.api = ImageAttributeBlock.api = 'block-provider';

ImageAttributeBlock.prototype.place = function() {
  return 'wherever';
};

ImageAttributeBlock.prototype.load = function(content) {
  var self = this;
  var img = this.getImage();
  debug('load', img);
  if (typeof content === 'undefined' || typeof content === 'null') return;
  this.content = content;
  this.setContent(this.content);
  this.showImage();
  this.hideEditor();
  return this.content;
};

ImageAttributeBlock.prototype.edit = function() {
  var self = this;
  if (!this.editor) loadStyle(this.style);
  this.hideImage();
  this.showEditor();
  this.setEditorContent(this.content);
  debug('edit');
  return this.content;
};

ImageAttributeBlock.prototype.save = function() {
  // save all nested blocks
  this.content = this.getEditorContent();
  return this.content;
};

/**
 * Base functions.
 */

ImageAttributeBlock.prototype.getContent = function() {
  var img = this.getImage();

  var content = {
    src: '',
    alt: '',
    style: '',
    class: ''
  }

  if (img) {
    content = {
      src: img.getAttribute('src'),
      alt: img.getAttribute('alg'),
      style: img.getAttribute('style'),
      class: img.getAttribute('class')
    };
  }

  debug('getContent', img, content);

  return content;
};

/**
 * image display stuff.
 */

ImageAttributeBlock.prototype.setContent = function(content) {
  debug('setContent', content);
  this.content = content;
  if (!content) return;
  var img = this.getImage();
  if (!img) {
    var html = imageTemplate(content);
    var dom = domify(html);
    debug('append img', html, this.el);
    this.el.appendChild(dom);
  } else {
    debug('update', img, content);
    img.setAttribute('src', content.src);
    img.setAttribute('alt', content.alt);
    img.setAttribute('class', content.class);
    img.setAttribute('style', content.style);
  }

};

ImageAttributeBlock.prototype.getImage = function() {
  this.img = this.el.querySelector('img');
  return this.img;
};

ImageAttributeBlock.prototype.showImage = function() {
  this.getImage();
  if (this.img) {
    removeClass(this.img, 'hidden');
  }
};

ImageAttributeBlock.prototype.hideImage = function() {
  this.getImage();
  if (this.img) {
    addClass(this.img, 'hidden');
  }
};

/**
 * editor stuff
 */

ImageAttributeBlock.prototype.getEditorContent = function() {

  var content = {
    src: '',
    alt: '',
    style: '',
    class: ''
  }

  if (!this.editor) return content;

  content.src = urlPathname(this.editor.querySelector('[name=src]').value);
  content.alt = this.editor.querySelector('[name=alt]').value;
  content.style = this.editor.querySelector('[name=style]').value;
  content.class = this.editor.querySelector('[name=class]').value;

  debug('getEditorContent', content);
  return content;
};

ImageAttributeBlock.prototype.setEditorContent = function(content) {
  debug('setEditorContent', content);
  if (!content || !this.editor) return;

  this.editor.querySelector('[name=src]').value = content.src;
  this.editor.querySelector('[name=alt]').value = content.alt;
  this.editor.querySelector('[name=style]').value = content.style;
  this.editor.querySelector('[name=class]').value = content.class;
};


ImageAttributeBlock.prototype.getEditor = function() {
  this.editor = this.el.querySelector('[data-id=image-editor]');
  return this.editor;
};

ImageAttributeBlock.prototype.showEditor = function() {
  this.getEditor();
  if (!this.editor) {
    this.content.editorTitle = this.el.getAttribute('data-editor-title');
    var html = editorTemplate(this.content);
    var dom = domify(html);
    debug('append editor', html, this.el);
    this.el.appendChild(dom);
    this.getEditor();
  }
  if (this.editor) {
    if (this.el) {
      this.el.style.cssText = 'display:block !important';
    }
    removeClass(this.editor, 'hidden');
  }
};

ImageAttributeBlock.prototype.hideEditor = function() {
  this.getEditor();
  if (this.editor) {
    if (this.el) this.el.style.cssText = '';
    addClass(this.editor, 'hidden');
  }
};

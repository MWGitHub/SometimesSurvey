module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _deku = __webpack_require__(2);
	
	var _state = __webpack_require__(3);
	
	var _state2 = _interopRequireDefault(_state);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/** @jsx element */
	/* eslint-disable import/no-unresolved */
	
	
	function initialState() {
	  return {
	    hasAnimated: false,
	    isAnimating: true,
	    container: null,
	    showLike: false,
	    isClosing: false,
	    likeHandler: null
	  };
	}
	
	function checkScroll(_ref) {
	  var props = _ref.props;
	  var state = _ref.state;
	
	  if (!state.container) return;
	  var container = state.container;
	  var percent = props.percent || 0.75;
	
	  var middle = window.pageYOffset || document.documentElement.scrollTop;
	  middle += window.innerHeight / 2;
	  var itemBottom = container.offsetTop + container.offsetHeight;
	  var space = itemBottom - middle;
	
	  if (space < 0 || space / container.offsetHeight <= 1 - percent) {
	    props.onSurveyShown && props.onSurveyShown(props.survey, props.item);
	    props.onImpression && props.onImpression(props.survey, props.item);
	  }
	}
	
	function checkItem(_ref2) {
	  var props = _ref2.props;
	
	  if (props.item === undefined || props.item === null) {
	    props.onItemStatus && props.onItemStatus(props.survey, props.item, false);
	    return;
	  }
	
	  if (!props.onCheckItem) return;
	
	  props.onCheckItem(props.survey, props.item).then(function (result) {
	    props.onItemStatus && props.onItemStatus(props.survey, props.item, result);
	  });
	}
	
	function toggleScrollChecks(model) {
	  var props = model.props;
	  var state = model.state;
	  var setState = model.setState;
	
	  if (props.show && state.isAnimating) {
	    setState({ isAnimating: false }, true);
	    return;
	  }
	
	  if (!props.valid || state.hasAnimated) return;
	
	  model.setState({ hasAnimated: true }, true);
	
	  window.requestAnimationFrame(function frame() {
	    if (state.isAnimating) {
	      checkScroll(model);
	      window.requestAnimationFrame(frame);
	    }
	  });
	}
	
	function thanksClose(setState, state, props) {
	  if (state.isClosing) return;
	
	  var closeTime = props.closeTime || 1000;
	  setState({ isClosing: true }, false, props.stateAction);
	  window.setTimeout(function () {
	    props.onClose && props.onClose(props.survey, props.item);
	    if (props.FB && state.handleLike) {
	      props.FB.Event.unsubscribe('edge.create', state.handleLike);
	    }
	  }, closeTime);
	}
	
	function handleLike(model) {
	  var props = model.props;
	  var state = model.state;
	  var setState = model.setState;
	
	
	  if (state.likeHandler) return function () {};
	
	  function like() {
	    props.onLike && props.onLike(props.survey, props.item);
	    thanksClose(setState, state, props);
	  }
	
	  setState({ likeHandler: like }, true);
	  return like;
	}
	
	function handleLikeClose(_ref3) {
	  var setState = _ref3.setState;
	  var state = _ref3.state;
	  var props = _ref3.props;
	
	  if (state.isClosing) return function () {};
	
	  return function () {
	    props.onLikeClose && props.onLikeClose(props.survey, props.item);
	
	    thanksClose(setState, state, props);
	  };
	}
	
	function handleClick(setState, state, props, score) {
	  return function () {
	    props.onRate && props.onRate(props.survey, props.item, score);
	    if (props.liked) {
	      thanksClose(setState, state, props);
	      return;
	    }
	
	    var threshold = props.threshold || 7;
	    if (score >= threshold) {
	      setState({
	        showLike: true
	      }, false, props.stateAction);
	    } else {
	      thanksClose(setState, state, props);
	    }
	  };
	}
	
	function createSurvey(model, isInteractive) {
	  var setState = model.setState;
	  var state = model.state;
	  var props = model.props;
	
	  function interact(fn) {
	    if (isInteractive) return fn;
	
	    return function () {};
	  }
	
	  var bars = [1, 2, 3, 4, 5, 10, 9, 8, 7, 6];
	  bars = bars.map(function (v) {
	    var cls = '';
	    if (v <= bars.length / 2) {
	      cls += 'survey-rating__bar--left ';
	    } else {
	      cls += 'survey-rating__bar--right ';
	    }
	    cls += 'survey-rating__bar survey-rating__bar--' + v + ' ';
	    return (0, _deku.element)('div', {
	      key: v,
	      'class': cls,
	      onClick: interact(handleClick(setState, state, props, v))
	    });
	  });
	
	  var viewClass = 'survey__view ';
	  var likeClass = 'survey__like ';
	  var thanksClass = 'survey__thanks ';
	  if (state.isClosing) {
	    viewClass += 'survey__view--hide';
	    likeClass += 'survey__like--hide';
	    thanksClass += 'survey__thanks--show';
	  } else if (state.showLike) {
	    viewClass += 'survey__view--hide';
	    likeClass += 'survey__like--show';
	    if (props.FB) {
	      props.FB.XFBML.parse();
	      props.FB.Event.subscribe('edge.create', handleLike(model));
	    }
	  }
	  return (0, _deku.element)(
	    'div',
	    { 'class': 'survey-wrapper' },
	    (0, _deku.element)(
	      'div',
	      { 'class': viewClass },
	      (0, _deku.element)(
	        'div',
	        { 'class': 'survey__question' },
	        props.question
	      ),
	      (0, _deku.element)(
	        'div',
	        { 'class': 'survey__rating' },
	        (0, _deku.element)(
	          'div',
	          { 'class': 'survey-rating__bars' },
	          bars
	        ),
	        (0, _deku.element)(
	          'div',
	          { 'class': 'survey-rating__descriptions' },
	          (0, _deku.element)(
	            'div',
	            { 'class': 'survey-rating__descriptions--left' },
	            'Not at all'
	          ),
	          (0, _deku.element)(
	            'div',
	            { 'class': 'survey-rating__descriptions--right' },
	            'Absolutely'
	          )
	        )
	      )
	    ),
	    (0, _deku.element)(
	      'div',
	      { 'class': likeClass },
	      (0, _deku.element)(
	        'div',
	        { 'class': 'survey-like__thanks' },
	        'Thanks! Follow Mic on Facebook'
	      ),
	      (0, _deku.element)(
	        'div',
	        { 'class': 'survey-like__actions' },
	        (0, _deku.element)(
	          'div',
	          { 'class': 'survey-actions--left' },
	          props.likeButton
	        ),
	        (0, _deku.element)(
	          'div',
	          {
	            'class': 'survey-actions--right',
	            onClick: interact(handleLikeClose(model))
	          },
	          'No, I\'m good'
	        )
	      )
	    ),
	    (0, _deku.element)(
	      'div',
	      { 'class': thanksClass },
	      (0, _deku.element)(
	        'div',
	        { 'class': 'survey-thanks__main' },
	        'Thanks!'
	      )
	    ),
	    (0, _deku.element)(
	      'div',
	      { 'class': 'survey__close', onClick: interact(props.onClose) },
	      'x'
	    )
	  );
	}
	
	function render(model) {
	  var props = model.props;
	  var state = model.state;
	
	  var view = null;
	
	  if (state.hasAnimated) {
	    if (props.show) {
	      view = createSurvey(model, true);
	    } else {
	      view = createSurvey(model, false);
	    }
	  }
	
	  var surveyClass = 'survey ';
	  surveyClass += props.show ? 'survey--show' : 'survey--hidden';
	  return (0, _deku.element)(
	    'div',
	    { 'class': surveyClass },
	    view
	  );
	}
	
	function isReady(_ref4) {
	  var props = _ref4.props;
	
	  return props.survey !== undefined && props.survey !== null && props.container && props.item !== undefined && props.item !== null;
	}
	
	function onCreate(model) {
	  var props = model.props;
	  if (!isReady(model)) return;
	
	  model.setState({
	    container: props.container
	  }, true);
	  checkItem(model);
	
	  toggleScrollChecks(model);
	}
	
	function onUpdate(model) {
	  var props = model.props;
	  if (!isReady(model)) return;
	
	  if (model.state.container !== props.container) {
	    checkItem(model);
	    model.setState({ container: props.container }, true);
	  }
	
	  toggleScrollChecks(model);
	}
	
	function onRemove(_ref5) {
	  var setState = _ref5.setState;
	
	  setState({ isAnimating: false }, true);
	}
	
	// :(
	// Couldn't think of doing this cleanly without states when using
	// requestAnimationFrame for better experience on mobile
	exports.default = (0, _state2.default)({
	  render: render,
	  onCreate: onCreate,
	  onUpdate: onUpdate,
	  onRemove: onRemove
	}, initialState);

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("deku");

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = state;
	
	var _lightDebounce = __webpack_require__(4);
	
	var _lightDebounce2 = _interopRequireDefault(_lightDebounce);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function state(component, initialState) {
	  var states = {};
	  var dispatch = null;
	  var action = null;
	
	  var update = (0, _lightDebounce2.default)(function () {
	    if (action) dispatch(action);
	  }, 0);
	
	  function setState(model) {
	    return function (changes, quiet, inputAction) {
	      states[model.path] = Object.assign(states[model.path], changes);
	      if (!quiet) {
	        dispatch = model.dispatch;
	        action = inputAction;
	        update();
	      }
	    };
	  }
	
	  function merge(model) {
	    return Object.assign({}, model, {
	      state: states[model.path],
	      setState: setState(model)
	    });
	  }
	
	  function render(model) {
	    if (!states[model.path]) {
	      if (initialState) {
	        states[model.path] = Object.assign({}, initialState());
	      } else {
	        states[model.path] = {};
	      }
	    }
	
	    return component.render(merge(model));
	  }
	
	  function onCreate(model) {
	    if (component.onCreate) component.onCreate(merge(model));
	  }
	
	  function onUpdate(model) {
	    if (component.onUpdate) component.onUpdate(merge(model));
	  }
	
	  function onRemove(model) {
	    delete states[model.path];
	    if (component.onRemove) component.onRemove(model);
	  }
	
	  return Object.assign({}, component, {
	    render: render,
	    onRemove: onRemove,
	    onUpdate: onUpdate,
	    onCreate: onCreate
	  });
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("light-debounce");

/***/ }
/******/ ]);
//# sourceMappingURL=index.js.map
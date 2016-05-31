/** @jsx element */
/* eslint-disable import/no-unresolved */
import { element } from 'deku';
import stater from './state';

function initialState() {
  return {
    hasAnimated: false,
    isAnimating: true,
    container: null,
    showLike: false,
    isClosing: false,
  };
}

function checkScroll({ props, state }) {
  if (!state.container) return;
  const container = state.container;
  const percent = props.percent || 0.75;

  let middle = window.pageYOffset || document.documentElement.scrollTop;
  middle += window.innerHeight / 2;
  const itemBottom = container.offsetTop + container.offsetHeight;
  const space = itemBottom - middle;

  if (space < 0 || space / container.offsetHeight <= 1 - percent) {
    props.onSurveyShown && props.onSurveyShown(props.item);
    props.onImpression && props.onImpression(props.item);
  }
}

function checkItem({ props }) {
  if (props.item === undefined || props.item === null) {
    props.onItemStatus && props.onItemStatus(false);
    return;
  }

  if (!props.onCheckItem) return;

  props.onCheckItem(props.item).then(result => {
    props.onItemStatus && props.onItemStatus(result);
  });
}

function toggleScrollChecks(model) {
  const { props, state, setState } = model;
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

  const closeTime = props.closeTime || 1000;
  setState({ isClosing: true });
  window.setTimeout(() => {
    props.onClose && props.onClose();
  }, closeTime);
}

function handleClose({ setState, state, props }) {
  if (state.isClosing) return () => {};

  return () => {
    thanksClose(setState, state, props);
  };
}

function handleClick(setState, state, props, score) {
  return () => {
    props.onRate && props.onRate(props.item, score);
    if (props.liked) return;

    const threshold = props.threshold || 7;
    if (score >= threshold) {
      setState({
        showLike: true,
      });
    } else {
      thanksClose(setState, state, props);
    }
  };
}

function createSurvey(model, isInteractive) {
  const { setState, state, props } = model;
  function interact(fn) {
    if (isInteractive) return fn;

    return () => {};
  }

  let bars = [1, 2, 3, 4, 5, 10, 9, 8, 7, 6];
  bars = bars.map(v => {
    let cls = '';
    if (v <= bars.length / 2) {
      cls += 'survey-rating__bar--left ';
    } else {
      cls += 'survey-rating__bar--right ';
    }
    cls += `survey-rating__bar survey-rating__bar--${v} `;
    return (
      <div
        key={v}
        class={cls}
        onClick={interact(handleClick(setState, state, props, v))}
      >
      </div>
    );
  });

  let viewClass = 'survey__view ';
  let likeClass = 'survey__like ';
  let thanksClass = 'survey__thanks ';
  if (state.isClosing) {
    viewClass += 'survey__view--hide';
    likeClass += 'survey__like--hide';
    thanksClass += 'survey__thanks--show';
  } else if (state.showLike) {
    viewClass += 'survey__view--hide';
    likeClass += 'survey__like--show';
  }
  return (
    <div class="survey-wrapper">
      <div class={viewClass}>
        <div class="survey__question">
          {props.question}
        </div>
        <div class="survey__rating">
          <div class="survey-rating__bars">
            {bars}
          </div>
          <div class="survey-rating__descriptions">
            <div class="survey-rating__descriptions--left">Not at all</div>
            <div class="survey-rating__descriptions--right">Absolutely</div>
          </div>
        </div>
      </div>
      <div class={likeClass}>
        <div class="survey-like__thanks">Thanks! Follow Mic on Facebook</div>
        <div class="survey-like__actions">
          <div class="survey-actions--left">
            <iframe src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&width=50&layout=button&action=like&show_faces=false&share=false&height=65&appId=189535844765631" width="50" height="65" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>
          </div>
          <div
            class="survey-actions--right"
            onClick={interact(handleClose(model))}
          >
            No, I'm good
          </div>
        </div>
      </div>
      <div class={thanksClass}>
        <div class="survey-thanks__main">Thanks!</div>
      </div>
      <div class="survey__close" onClick={interact(props.onClose)}>
        x
      </div>
    </div>
  );
}

function render(model) {
  const { props, state } = model;
  let view = null;

  if (state.hasAnimated) {
    if (props.show) {
      view = createSurvey(model, true);
    } else {
      view = createSurvey(model, false);
    }
  }

  let surveyClass = 'survey ';
  surveyClass += props.show ? 'survey--show' : 'survey--hidden';
  return (
    <div class={surveyClass}>
      {view}
    </div>
  );
}

function onCreate(model) {
  const props = model.props;
  model.setState({
    container: props.container,
  }, true);
  checkItem(model);

  toggleScrollChecks(model);
}

function onUpdate(model) {
  const props = model.props;
  model.setState({
    container: props.container,
  }, true);
  if (model.state.container !== model.props.container) {
    checkItem(model);
    model.setState({ container: model.props.container }, true);
  }

  toggleScrollChecks(model);
}

function onRemove({ setState }) {
  setState({ isAnimating: false }, true);
}

// :(
// Couldn't think of doing this cleanly without states when using
// requestAnimationFrame for better experience on mobile
export default stater({
  render,
  onCreate,
  onUpdate,
  onRemove,
}, initialState);

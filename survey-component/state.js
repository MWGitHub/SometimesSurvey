import debounce from 'light-debounce';

export default function state(component, initialState) {
  const states = {};
  let dispatch = null;
  let action = null;

  const update = debounce(() => {
    if (action) dispatch(action);
  }, 0);

  function setState(model) {
    return (changes, quiet, inputAction) => {
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
      setState: setState(model),
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
    render,
    onRemove,
    onUpdate,
    onCreate,
  });
}

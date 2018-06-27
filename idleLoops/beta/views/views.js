window.Views = {
    registerView : function (viewName,view) {
      Views.views.push(viewName);
      Views[viewName] = view;
    },
    views : [],
    draw : function () {
      $(Views.views).each(function(x,viewName) {
          $(Views[viewName].selector).html(Views[viewName].html());
      })
    },
}

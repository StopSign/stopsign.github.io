window.Views = {
    // activates verbose mode
    debug: true,
    // a vue can be registered if it implements an html function, that returns the html
    // once a view VIEWNAME is registered, it can be called using Views.VIEWNAME
    registerView(viewName, view) {
        let canDraw = true;
        // error handling
        if (typeof (viewName) === "string") {
            if (typeof (Views[viewName]) !== "undefined") {
                if (debug)
                    console.warn(`Overriding the vue ${viewName} because another view has been registered with the same viewName.`);
                // the view overriten won't be drawn because :
                // it's either the same view registered, and is already planed to be drawn
                // or it's another view, and this warning should be taken seriously.
                // this case doesn't return false because in some case you could have multiple registrations of the same view.
                canDraw = false;
            }
        } else {
            console.error("Trying to register a view without giving a viewName.");
            return false;
        }
        // this isn't blocking, a vue can exist without being drawn
        if (typeof (view.selector) === "undefined") {
            if (Views.debug)
                console.warn(`Trying to register view ${viewName} but the view doesn't have a selector key, it won't be drawn.`);
            canDraw = false;
        }
        if (typeof (view.html) === "undefined") {
            if (typeof (view.selector) !== "undefined") {
                console.error(`Trying to register view ${viewName} with a selector but no html method. View not registered.`);
                return false;
            }
        }
        if (canDraw)
            Views.views.push(viewName);
        Views[viewName] = view;
        return true;
    },
    views: [],
    draw() {
        $(Views.views).each((_index, viewName) => {
            $(Views[viewName].selector).html(Views[viewName].html());
        });
    }
};

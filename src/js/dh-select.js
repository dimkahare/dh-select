define(
    'dh-select',
    [],
    function () {
        var options = {
                name: 'unnamed-control'
            },
            API = {
                init: initialize
            },
            data = [];

        return API;

        function initialize($target, customData, customOptions) {
            data = customData || data;
            extend(options, customOptions);

            $target.empty();
            $target.append(renderList(options.name, data));

        }

        function renderList(name, list) {
            var $ul, $li;

            $ul = $('<ul>')
            for (var i = 0; i < list.length; i++) {
                $li = $('<li>');
                $li.html(getListItem(name, list[i].value, list[i].title));
                if (list[i].childs) {
                    /*
                    $li
                        .addClass('dh-have-sub-list')
                        .addClass('collapsed');
                    */
                    $li.append( renderList(name, list[i].childs));
                    /*
                    $li.children('ul').hide()
                    */
                }
                $ul.append($li);
            }

            return $ul;

            function getListItem(name, value, label) {
                return getInput(name, value) + getLabel(name, value, label);

                function getInput(name, value) {
                    return '<input name="' + name + '"' +
                    ' id="' + getControlId(name, value) + '"' +
                    ' value="' + value + '"' +
                    ' type="radio"></input>';
                }

                function getLabel(name, value, label) {
                    return '<label for="' + getControlId(name, value) + '">' + label + ' (' + value + ')' + '</label>';
                }

                function getControlId(name, value) {
                    return name + '_' + value;
                }
            }
        }

        function extend(obj1, obj2) {
            for (var key in obj2) {
                if (obj2.hasOwnProperty(key)) {
                    obj1[key] = obj2[key];
                }
            }

            return obj1;
        }
    }
);

/*
var dhSelect = (function () {

    function setSliders($target) {
        $target.find('label').on('click', function (e) {
            $(e.target).closest('li').toggleClass('collapsed');
            $(e.target).next('ul').slideToggle();
        });
    }
})();

*/

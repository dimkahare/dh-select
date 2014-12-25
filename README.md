# Dropdown menu with search
### Instalation
```sh
bower install dh-select
```
### Using
```js
require(['dh-select'], function (DhSelect) {
    var categorySelect;

    categorySelect = new DhSelect(
        $('#category'),
        categoriesData,
        {
            name: 'category'
        }
    );
    categorySelect.setValue(currentValue);
});
```
where ```categoriesData``` is array with objects:
```js
{
    value: 1;   
    title: 'title', // text that will be shown as menu item
    childs: [...]   // optional, array of same objects
}
```
or just use global constructor ```DhSelect```

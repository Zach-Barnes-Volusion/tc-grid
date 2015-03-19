"use strict";

(function () {
  "use strict";
  var tcGrid = function ($parse, $compile, $templateCache) {
    return {
      restrict: "E",
      scope: {
        options: "=?tcOptions"
      },
      compile: function (element, attrs, transclude) {
        var children = element.children();
        var headerHtml = "";

        attrs.columns = [];

        angular.forEach(children, function (child, index) {
          var el = angular.element(child);
          var colField = el.attr("tc-field");
          var colName = el.attr("tc-name") || colField || "";
          var sort = el.attr("tc-sort");
          var ignoreClick = el.attr("tc-ignore-click");
          var colClass = el.attr("tc-class");

          var sortFn = "";
          var headerId = "";

          if (colField) {
            sortFn = " ng-click=\"vm.sort('" + colField + "')\"";
            headerId = " id=\"" + attrs.tcGridOptions + "_" + colField.replace(/\./g, "") + "\"";
            attrs.columns.push(colField);

            if (el.html() === "") {
              el.html("{{row." + colField + "}}");
            }
          }

          if (ignoreClick) el.attr("ng-click", "$event.stopPropagation();");


          el.addClass(colClass || "tc-style_td");
          el.attr("tc-col-index", index + 1);

          headerHtml += "<div class=\"tc-display_th tc-style_th tc-display_sort tc-style_sort\"" + headerId + sortFn + ">" + colName + "</div>";

          if (colName) {
            var mobileHeader = "<div class=\"tc-mobile-header\">" + colName + "</div>";
            el.prepend(mobileHeader);
          }
        });

        var templateHtml = $templateCache.get("tcGrid.html");
        templateHtml = templateHtml.replace(/%OPTIONS%/g, attrs.tcGridOptions);
        templateHtml = templateHtml.replace(/%HEADER%/g, headerHtml);
        templateHtml = templateHtml.replace(/%DATA%/g, attrs.tcData);
        templateHtml = templateHtml.replace(/%GRIDCLASS%/g, attrs.tcGridClass || "tc-grid");
        templateHtml = templateHtml.replace(/%ROWCLICK%/g, attrs.tcRowClick ? "ng-click=\"" + attrs.tcRowClick + "\"" : "");
        templateHtml = templateHtml.replace(/%FILTER%/g, attrs.tcGridFilter ? " | filter: " + attrs.tcGridFilter : "");
        templateHtml = templateHtml.replace(/%ROWCLASS%/g, attrs.tcRowClass || "tc-style_tr");
        templateHtml = templateHtml.replace(/%CHILDREN%/g, children.parent().html());

        var template = angular.element(templateHtml);

        element.html("");
        element.append(template);

        return {
          pre: function (scope, ele, attrs, ctrl) {},
          post: function (scope, element, attrs, ctrl) {
            $compile(element.contents())(scope);
          }
        };
      },
      controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
        var init = function () {
          $scope.vm = vm;

          initOptions();
          initWatch();

          if ($scope.options) {
            if ($scope.options.sorting.onSortChange) sortChanged();else if ($scope.options.paging.onPageChange) pageChanged();
          }
        };

        var initOptions = function () {
          if (!$scope.options) return;

          if ($scope.options.paging) initPaging();

          if ($scope.options.sorting) initSort();
        };

        var initWatch = function () {
          var pageCountWatcher = function () {
            if (!watchInitialized) {
              watchInitialized = true;
              return;
            }

            if ($scope.options && $scope.options.paging) getPageCount();
          };

          $scope.$watch("options", pageCountWatcher, true);
        };

        var initPaging = function () {
          if (!$scope.options.paging.pageSize || $scope.options.paging.pageSize < 1) $scope.options.paging.pageSize = 20;

          if (!$scope.options.paging.totalItemCount || $scope.options.paging.totalItemCount < 0) $scope.options.paging.totalItemCount = 0;

          if (!$scope.options.paging.currentPage || $scope.options.paging.currentPage < 1) $scope.options.paging.currentPage = 1;

          getPageCount();

          vm.showFooter = true;
        };

        var initSort = function () {
          if (!$scope.options.sorting.sort) return;

          angular.forEach($scope.options.sorting.sort, function (sortItem) {
            var col = sortItem.split(" ")[0];
            var dir = sortItem.split(" ")[1] || "asc";

            var column = fetchColumn(col);
            column.addClass(dir.toLowerCase());
          });
        };

        var getPageCount = function () {
          vm.pageCount = $scope.options.paging.totalItemCount > 0 ? Math.ceil($scope.options.paging.totalItemCount / $scope.options.paging.pageSize) : 0;

          if (vm.pageCount < 1) {
            vm.pageCount = 1;
          }
        };

        var first = function () {
          $scope.options.paging.currentPage = 1;
          pageChanged();
        };

        var prev = function () {
          $scope.options.paging.currentPage -= 1;
          if ($scope.options.paging.currentPage < 1) {
            $scope.options.paging.currentPage = 1;
          }
          pageChanged();
        };

        var next = function () {
          $scope.options.paging.currentPage += 1;
          if ($scope.options.paging.currentPage > vm.pageCount) {
            $scope.options.paging.currentPage = vm.pageCount;
          }
          pageChanged();
        };

        var last = function () {
          $scope.options.paging.currentPage = vm.pageCount;
          pageChanged();
        };

        var pageChanged = function () {
          if ($scope.options.paging.onPageChange) {
            $scope.options.paging.onPageChange($scope.options.paging.currentPage, $scope.options.paging.pageSize, $scope.options.sorting.sort);
          }
        };

        var sortChanged = function () {
          if ($scope.options.sorting.onSortChange) {
            if ($scope.options.paging) {
              $scope.options.paging.currentPage = 1;
              $scope.options.sorting.onSortChange($scope.options.paging.currentPage, $scope.options.paging.pageSize, $scope.options.sorting.sort);
            } else {
              $scope.options.sorting.onSortChange(null, null, $scope.options.sorting.sort);
            }
          }
        };

        var sort = function (field) {
          if (vm.columns.length === 0) return;

          var col = fetchColumn(field);

          var direction = "asc";

          if (col.hasClass("asc")) direction = "desc";

          cleanSortClasses();

          col.addClass(direction);

          $scope.options.sorting.sort = [field + " " + direction];

          sortChanged();
        };

        var cleanSortClasses = function () {
          angular.forEach(vm.columns, function (col) {
            var colElement = fetchColumn(col);
            colElement.removeClass("desc");
            colElement.removeClass("asc");
          });
        };

        var fetchColumn = function (name) {
          var id = $attrs.tcGridOptions + "_" + name.replace(/\./g, "");
          return angular.element(document.getElementById(id));
        };

        var addColumn = function (name) {
          if (vm.columns.indexOf(name) == -1) vm.columns.push(name);
        };

        this.addColumn = addColumn;

        var watchInitialized = false;

        var vm = {
          pageCount: 1,
          showFooter: false,
          prev: prev,
          next: next,
          first: first,
          last: last,
          sort: sort,
          columns: $attrs.columns
        };

        return init();
      }]
    };

  };
  tcGrid.$inject = ["$parse", "$compile", "$templateCache"];

  var tcGridColumn = function () {
    return {
      restrict: "E",
      require: "^tcGrid",
      replace: true,
      transclude: true,
      template: "<div class='tc-display_td' ng-transclude></div>",
      scope: true
    };
  };

  angular.module("tc-grid", []).directive("tcGrid", tcGrid).directive("tcColumn", tcGridColumn);
})();
angular.module("tc-grid").run(["$templateCache", function($templateCache) {$templateCache.put("tcGrid.html","<div class=\"tcGrid__scope\">\r\n    <div class=\"%GRIDCLASS%\">\r\n        <div class=\"tc-display_table tc-style_table\">\r\n            <div class=\"tc-display_thead tc-style_thead\">\r\n                <div class=\"tc-display_tr tc-style_tr\">\r\n                    %HEADER%\r\n                </div>\r\n            </div>\r\n            <div class=\"tc-display_tbody tc-style_tbody\">\r\n                <div class=\"tc-display_tr %ROWCLASS%\" id=\"tc-row-container\" ng-repeat=\"row in %DATA% %FILTER%\" %ROWCLICK%>\r\n                    %CHILDREN%\r\n                </div>\r\n            </div>\r\n           \r\n        </div>       \r\n        \r\n        <div class=\"tc-style_pager\" ng-show=\"vm.showFooter && vm.pageCount > 1\">\r\n            <div class=\"tc-style_item-total\">\r\n                {{(options.paging.currentPage - 1) * options.paging.pageSize + 1}}\r\n                -\r\n                {{options.paging.currentPage === vm.pageCount ? options.paging.totalItemCount : options.paging.currentPage * options.paging.pageSize}}\r\n                of\r\n                {{options.paging.totalItemCount}}\r\n            </div>\r\n            <div class=\"tc-style_page-nav\">\r\n                <span class=\"tc-style_page-display\">{{options.paging.currentPage}} / {{vm.pageCount}}</span>\r\n                <button class=\"tc-button\" ng-click=\"vm.first()\" ng-disabled=\"options.paging.currentPage === 1\"><strong>|</strong>&#9668;</button>\r\n                <button class=\"tc-button\" ng-click=\"vm.prev()\" ng-disabled=\"options.paging.currentPage === 1\">&#9668;</button>\r\n                <button class=\"tc-button\" ng-click=\"vm.next()\" ng-disabled=\"options.paging.currentPage === vm.pageCount\">&#9658;</button>\r\n                <button class=\"tc-button\" ng-click=\"vm.last()\" ng-disabled=\"options.paging.currentPage === vm.pageCount\">&#9658;<strong>|</strong></button>\r\n            </div>\r\n            <div class=\"clearfix\"></div>\r\n        </div>        \r\n    </div>    \r\n</div>");}]);
angular.module("tc-grid").run(["$templateCache", function($templateCache) {$templateCache.put("tcGrid.html","<div class=\"tcGrid__scope\">\r\n    <div class=\"%GRIDCLASS%\">\r\n        <div class=\"tc-display_table tc-style_table\">\r\n            <div class=\"tc-display_thead tc-style_thead\">\r\n                <div class=\"tc-display_tr tc-style_tr\">\r\n                    %HEADER%\r\n                </div>\r\n            </div>\r\n            <div class=\"tc-display_tbody tc-style_tbody\">\r\n                <div class=\"tc-display_tr %ROWCLASS%\" id=\"tc-row-container\" ng-repeat=\"row in %DATA% %FILTER%\" %ROWCLICK%>\r\n                    %CHILDREN%\r\n                </div>\r\n            </div>\r\n           \r\n        </div>       \r\n        \r\n        <div class=\"tc-style_pager\" ng-show=\"%OPTIONS%.internal.showFooter && %OPTIONS%.internal.pageCount > 1\">\r\n            <div class=\"tc-grid_item-total\">\r\n                {{(%OPTIONS%.paging.currentPage - 1) * %OPTIONS%.paging.pageSize + 1}}\r\n                -\r\n                {{%OPTIONS%.paging.currentPage === %OPTIONS%.internal.pageCount ? %OPTIONS%.paging.totalItemCount : %OPTIONS%.paging.currentPage * %OPTIONS%.paging.pageSize}}\r\n                of\r\n                {{%OPTIONS%.paging.totalItemCount}}\r\n            </div>\r\n            <div class=\"tc-style_page-nav\">\r\n                <span class=\"tc-page-display\">{{%OPTIONS%.paging.currentPage}} / {{%OPTIONS%.internal.pageCount}}</span>\r\n                <button class=\"tc-button\" ng-click=\"%OPTIONS%.internal.first()\" ng-disabled=\"%OPTIONS%.paging.currentPage === 1\"><i class=\"fa fa-fast-backward\"></i></button>\r\n                <button class=\"tc-button\" ng-click=\"%OPTIONS%.internal.prev()\" ng-disabled=\"%OPTIONS%.paging.currentPage === 1\"><i class=\"fa fa-play fa-rotate-180\"></i></button>\r\n                <button class=\"tc-button\" ng-click=\"%OPTIONS%.internal.next()\" ng-disabled=\"%OPTIONS%.paging.currentPage === %OPTIONS%.internal.pageCount\"><i class=\"fa fa-play \"></i></button>\r\n                <button class=\"tc-button\" ng-click=\"%OPTIONS%.internal.last()\" ng-disabled=\"%OPTIONS%.paging.currentPage === %OPTIONS%.internal.pageCount\"><i class=\"fa fa-fast-forward\"></i></button>\r\n            </div>\r\n            <div class=\"clearfix\"></div>\r\n        </div>\r\n    </div>\r\n\r\n</div>");}]);
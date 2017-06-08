const extend = require('js-base/core/extend');
const Page = require('sf-core/ui/page');
const PageDesign = require("../../../ui/ui_pgExpanseManagement");
const ListViewItem = require('sf-core/ui/listviewitem');
const ItemExpense = require('../../../components/ItemExpense');
const Router = require("sf-core/router");

const TITLE = "EXPENSE MANAGEMENT";

const Page_ = extend(PageDesign)(
	// Constructor
	function(_super){
		// Initalizes super class for this page scope
		_super(this);
		this.onShow = onShow.bind(this, this.onShow.bind(this));
		this.onLoad = onLoad.bind(this, this.onLoad.bind(this));
    }
);

function onShow(parentOnShow) {
    parentOnShow();
}

function onLoad(parentOnLoad) {
    parentOnLoad();
    this.layoutHeaderBar.children.headerBarTitle.text = TITLE;
    
    this.listView.rowHeight = 75;
    this.listView.itemCount = 100;
    this.listView.onRowCreate = function() {
        var myListViewItem = new ListViewItem();
        var item = new ItemExpense();
        item.id = 200;

        myListViewItem.addChild(item);
        return myListViewItem;
    };
    this.listView.onRowSelected = function() {
        Router.go("tabs/hr/newExpense");
    };
}

module && (module.exports = Page_);
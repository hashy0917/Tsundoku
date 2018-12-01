import { Component } from '@angular/core';
import { ActionSheetController, ModalController } from 'ionic-angular';
import 'firebase/functions';

import { RegisteredBook } from 'shared/entity';
import { BookCreationModal } from './book-creation-modal/book-creation-modal';
import { SearchByIsbnModal } from './search-by-isbn-modal/search-by-isbn-modal';
import { SearchBySkillModal } from './search-by-skill-modal/search-by-skill-modal';
import { Store } from '@ngrx/store';
import { State } from '../../app/state/_state.interfaces';
import { WatchBookshelf } from '../../app/state/bookshelf/bookshelf.action';

@Component({
  selector: 'page-bookshelf',
  templateUrl: 'bookshelf.html'
})
export class BookshelfPage {
  registeredBooks: RegisteredBook[] = [];
  additions = [];

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private store: Store<State>
  ) {}

  ionViewDidLoad() {
    window.addEventListener('resize', () => this.adjustThumbnails());

    this.store.dispatch(new WatchBookshelf());

    /*this.bookshelfService.getBookshelf().subscribe(book => {
      updateDynamicList(this.registeredBooks, book);
      sortByDatetime({ key: 'modified', objects: this.registeredBooks }, 'asc');
      this.adjustThumbnails();
    });*/
  }

  adjustThumbnails() {
    const firstThumbnail = document.getElementsByClassName('book-thumbnail')[0];
    if (firstThumbnail === void 0) return;

    const booksRow = document.getElementById('books-row'),
      bookWidth = parseInt(
        window.getComputedStyle(firstThumbnail).width as string,
        10
      ),
      columns = Math.floor(
        parseInt(
          window.getComputedStyle(booksRow as HTMLElement).width as string,
          10
        ) /
          (bookWidth + 10)
      );

    if (columns > this.registeredBooks.length) {
      this.additions = [];
      return;
    }

    const rest = this.registeredBooks.length % columns;
    if (rest === 0) return;

    const diff = columns - rest;

    if (diff > this.additions.length) {
      Array.prototype.push.apply(
        this.additions,
        new Array(diff - this.additions.length)
      );
    } else if (diff < this.additions.length) {
      this.additions.splice(0, this.additions.length - diff);
    }
  }

  async addBook() {
    await this.actionSheetCtrl
      .create({
        title: '本を追加する',
        buttons: [
          {
            text: '本をISBNで検索する',
            handler: () => {
              // tslint:disable-next-line:no-floating-promises
              this.modalCtrl.create(SearchByIsbnModal).present();
            }
          },
          {
            text: '本をスキルで検索する',
            handler: () => this.modalCtrl.create(SearchBySkillModal).present()
          },
          {
            text: '本の情報を手動入力する',
            handler: () => this.modalCtrl.create(BookCreationModal).present()
          },
          {
            text: 'キャンセル',
            role: 'cancel'
          }
        ]
      })
      .present();
  }
}

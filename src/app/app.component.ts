import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, importProvidersFrom, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import { IndexDbService } from './services/index-db.service';
import { OnlyNumberDirective } from './directive';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MarkdownModule,
    OnlyNumberDirective,
  ],
  templateUrl: './app.component.html',
  providers: [provideMarkdown(), IndexDbService],
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  questions: any = [];
  http = inject(HttpClient);
  private indexDb = inject(IndexDbService);
  questionNumber = 1;
  ngOnInit(): void {
    this.indexDb.createLayerDB();
    this.getData();
  }

  // Function to check if data is not available or is older than 7 days
  shouldFetchData(date: any) {
    if (!date) {
      return true; // Data is not available
    }

    const lastUpdated = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / (1000 * 3600 * 24)
    );

    return diffInDays >= 7; // Data is older than 7 days
  }

  setData(reqData: any) {
    this.indexDb.saveQuestionsRecords(reqData);
  }

  async getData() {
    const questionsObj: any[] = await this.indexDb.retrieveQuestions();
    if (questionsObj?.length) {
      this.setQuestion(questionsObj[0]);
    } else {
      this.fetchQuestions();
    }
  }

  fetchQuestions() {
    this.http
      .get(
        'https://api.github.com/repos/sudheerj/angular-interview-questions/contents/README.md?ref=master',
        { responseType: 'text' }
      )
      .subscribe({
        next: (data: any) => {
          const reqData = JSON.parse(data);
          reqData && this.setData(reqData);
          this.setQuestion(reqData);
          console.log('new data fetched!');
        },
        error: (err: any) => {
          console.error('🚀 ~ AppComponent ~ fetchQuestions ~ err:', err);
        },
      });
  }

  setQuestion(reqData: any) {
    let bytes = Uint8Array.from(atob(reqData.content), (c) => c.charCodeAt(0));
    let text = new TextDecoder().decode(bytes);
    this.questions = text
      .replace(/\\n/g, '  \n')
      .split(/(?<!#)###(?!#)/)
      .map((question: string, index: number) => {
        let que = `${index - 1}. ### ${question
          .replace(/\*\*\[⬆[^\]]+[\s\S]*/g, '')
          .replace(/images/g, 'assets/images')
          .replace(/```typescript/g, '```javascript')
          .replace(/\n\s*```/g, '\n```')
          .replace(/  /g, '')
          .replace(/# /g, '')
          .replace(/###(\w)/g, '### $1')}`;
        return que;
      });
    this.questions.splice(0, 2);
  }

  onNext() {
    this.questionNumber = +this.questionNumber + 1;
  }
  onBack() {
    if (+this.questionNumber === 1) {
      return;
    }
    this.questionNumber = +this.questionNumber - 1;
  }

  updateQuestionNumber(queNumber: string) {
    queNumber && (this.questionNumber = +queNumber);
  }
}

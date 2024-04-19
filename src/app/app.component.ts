import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
 import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MarkdownModule,
  ],
  templateUrl: './app.component.html',
  providers: [provideMarkdown()],
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  questions: any = [];
  http = inject(HttpClient);
  questionNumber = 1;
  ngOnInit(): void {
    this.fetchQuestions();
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
          let bytes = Uint8Array.from(atob(reqData.content), (c) =>
            c.charCodeAt(0)
          );
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
              .replace(/###(\w)/g, "### $1")}`;
              return que;
            });
          this.questions.splice(0, 2);
        },
        error: (err: any) => {
          console.error('🚀 ~ AppComponent ~ fetchQuestions ~ err:', err);
        },
      });
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

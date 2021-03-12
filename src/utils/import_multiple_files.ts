import { LoadingDialog } from "./DialogComponents";
import { promiseWait } from './promiseWait';

export const import_multiple_files = (
  file_selector_element: any,
  process_file: (file: File) => Promise<any>, /* should throw on error/failure */
) => {
  const listener = async () => {
    file_selector_element.removeEventListener("change", listener);
    const f_handle = file_selector_element.files[0];
    
    let num_processed = 0;
    const errors: Array<string> = [];
    const jobs: Array<Promise<any>> = [];

    const update_loading_bar = () => {
      pls_wait.set_text(`Importing ${num_processed}/${jobs.length} (Errors: ${errors.length})`);
    }

    let pls_wait = new LoadingDialog("Importing");
    update_loading_bar();

    pls_wait.show();

    const handle_error = (e: any, filename: string) => {
      errors.push(`Error processing ${filename}:\n\n${e}.\n\nThat item has not been imported.`);
    };

    const process_file_internal = async (handle: File) => {
      try {
        await process_file(handle);

        num_processed += 1;
        update_loading_bar();
      }
      catch(e) {
        handle_error(e, handle.name);
      }
    };

    for(const file_handle of file_selector_element.files) {
      const job = process_file_internal(file_handle);
      jobs.push(job);
    }

    await Promise.all(jobs);

    {
      let errors_text = "";
      if(errors.length > 0) {
        errors_text = `(with ${errors.length} errors)`;
      }

      pls_wait.set_text(`Done ${errors_text}!\nYour browser may freeze while Roll20 catches up with the influx of new items.`);
    }

    // NOTE(justasd): give the browser a chance to update the pls_wait text. (ugh)
    await promiseWait(100);

    for(const error of errors) {
      alert(error);
    }

    pls_wait.dispose();
  };

  file_selector_element.click();
  file_selector_element.addEventListener("change", listener);
}


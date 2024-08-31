# About

This project is a node.js express website with ability to stream movies in you local machine or server.
The website itself was made with ChatGPT, Gemini, Claude with me as a human guidance it was MY idea and not from these AI's.
Made by: salad

yes im Clyd

## Features

- Movies collection
- Stream movies in the browser
- Confusing autoplay functionality
- Keyboard shortcuts that barely works
- Might be responsive design for various devices

## Project Structure

To set up this project correctly, ensure your directory structure looks like this:

```
root/
├── (files in this repo)
│   ├── public
│   │   └── index.html
│   ├── server.js
│   └── ... (other files)
├── movies/
│   ├── Movie Name 1 (Year) [Quality]/
│   │   └── movie_file.mp4
│   ├── Movie Name 2 (Year) [Quality]/
│   │   └── movie_file.mkv
│   └── ...
```

### Important Notes:

1. The `movies` directory should be in the same parent directory as your project files.
2. Each movie should be in its own subdirectory under the `movies` directory.
3. Movie folder naming convention:
     Example: `Oppenheimer (2023) [4K]`

## Setup

1. Clone this repository to your local machine.
2. Create a `movies` directory in the parent directory of your project.
3. Add your movie files to the `movies` directory, following the folder naming convention described above.
4. Set up a local web server using `node server.js`.

## Usage

1. In terminal, run:
  `cd (whatever you named the folder from this repo)`
  `node server.js`
3. Open a tab on your browser and enter localhost://6969. (You can port forward or something if you want to expose the site to the internet.)
4. You have entered the matrix.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
please im begging

## License

This project is licensed under the MIT License - see the LICENSE file for details.

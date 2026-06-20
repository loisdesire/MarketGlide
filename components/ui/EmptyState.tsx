export default function EmptyState({ message }: { message: string }) {
  return (
    <table>
      <tbody>
        <tr className="empty-row">
          <td>{message}</td>
        </tr>
      </tbody>
    </table>
  );
}
